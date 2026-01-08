import { getRoles, createRole } from '@/lib/supabase/domains/roles/roles'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      activeOnly: searchParams.get('activeOnly') === 'true',
      active: searchParams.get('active'),
      limit: parseInt(searchParams.get('limit') || 10),
      offset: parseInt(searchParams.get('offset') || 0),
      orderBy: searchParams.get('orderBy') || 'created_at',
      orderDir: searchParams.get('order') || 'desc'
    }

    const result = await getRoles(filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/roles error:', error)
    return Response.json(
      { error: 'Failed to fetch roles', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    if (!data.code || !data.name) {
      return Response.json(
        { error: 'Validation error', message: 'Role code and name required' },
        { status: 400 }
      )
    }

    const role = await createRole(data)
    
    return Response.json(role, { status: 201 })
  } catch (error) {
    console.error('POST /api/roles error:', error)
    return Response.json(
      { error: 'Failed to create role', message: error.message },
      { status: 500 }
    )
  }
}

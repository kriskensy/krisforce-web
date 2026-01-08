import { getClientContracts, createClientContract } from '@/lib/supabase/domains/clients/contracts'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      activeOnly: searchParams.get('activeOnly') === 'true',
      active: searchParams.get('active'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'start_date',
      orderDir: searchParams.get('order') || 'desc'
    }

    const result = await getClientContracts(id, filters)
    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total.toString()
      }
    })
  } catch (error) {
    console.error('GET /api/clients/[id]/contracts error:', error)
    return Response.json(
      { error: 'Failed to fetch client contracts', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    
    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    if (!data.number || !data.start_date || !data.end_date || !data.value) {
      return Response.json(
        { error: 'Validation error', message: 'Contract number, dates and value required' },
        { status: 400 }
      )
    }

    const contract = await createClientContract(id, data)
    return Response.json(contract, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients/[id]/contracts error:', error)
    return Response.json(
      { error: 'Failed to create client contract', message: error.message },
      { status: 500 }
    )
  }
}
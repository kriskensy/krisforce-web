import { getTicketPriorities, createTicketPriority } from '@/lib/supabase/domains/enumerations/ticket_priorities'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      active: searchParams.get('active'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'level',
      orderDir: searchParams.get('order') || 'asc'
    }

    const result = await getTicketPriorities(filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/enumerations/ticket_priorities error:', error)
    return Response.json(
      { error: 'Failed to fetch ticket priorities', message: error.message },
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

    if (!data.code || !data.name || data.level === undefined) {
      return Response.json(
        { error: 'Validation error', message: 'Code, name and level required' },
        { status: 400 }
      )
    }

    const ticketPriority = await createTicketPriority(data)
    
    return Response.json(ticketPriority, { status: 201 })
  } catch (error) {
    console.error('POST /api/enumerations/ticket_priorities error:', error)
    return Response.json(
      { error: 'Failed to create ticket priority', message: error.message },
      { status: 400 }
    )
  }
}

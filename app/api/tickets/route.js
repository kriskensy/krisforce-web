import { getTickets, createTicket } from '@/lib/supabase/domains/tickets/tickets'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      activeOnly: searchParams.get('activeOnly') === 'true',
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      client: searchParams.get('client'),
      assignedto: searchParams.get('assignedto'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'created_at',
      orderDir: searchParams.get('order') || 'desc'
    }

    const result = await getTickets(filters)
    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total.toString()
      }
    })
  } catch (error) {
    console.error('GET /api/tickets error:', error)
    return Response.json(
      { error: 'Failed to fetch tickets', message: error.message },
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

    if (!data.subject || !data.client_id) {
      return Response.json(
        { error: 'Validation error', message: 'Ticket subject and client required' },
        { status: 400 }
      )
    }

    const ticket = await createTicket(data)
    return Response.json(ticket, { status: 201 })
  } catch (error) {
    console.error('POST /api/tickets error:', error)
    return Response.json(
      { error: 'Failed to create ticket', message: error.message },
      { status: 500 }
    )
  }
}
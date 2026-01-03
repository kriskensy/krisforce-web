import { getTicketStatuses, createTicketStatus } from '@/lib/supabase/domains/enumerations/ticket_statuses'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      active: searchParams.get('active'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'code',
      orderDir: searchParams.get('order') || 'asc'
    }

    const result = await getTicketStatuses(filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/enumerations/ticket_statuses error:', error)
    return Response.json(
      { error: 'Failed to fetch ticket statuses', message: error.message },
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
        { error: 'Validation error', message: 'Code and name required' },
        { status: 400 }
      )
    }

    const ticketStatus = await createTicketStatus(data)
    
    return Response.json(ticketStatus, { status: 201 })
  } catch (error) {
    console.error('POST /api/enumerations/ticket_statuses error:', error)
    return Response.json(
      { error: 'Failed to create ticket status', message: error.message },
      { status: 400 }
    )
  }
}

import { getTicketById, updateTicket, deactivateTicket, reactivateTicket } from '../../../../lib/supabase/domains/tickets/tickets'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const ticket = await getTicketById(id)

    if (!ticket)
      return Response.json({ error: 'Ticket not found' }, { status: 404 })

    return Response.json(ticket, { status: 200 })
  } catch (error) {
    console.error('GET /api/tickets/[id] error:', error)
    return Response.json(
      { error: 'Failed to fetch ticket', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    const ticket = await updateTicket(id, data)
    return Response.json(ticket, { status: 200 })
  } catch (error) {
    console.error('PUT /api/tickets/[id] error:', error)
    return Response.json(
      { error: 'Failed to update ticket', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const ticket = await deactivateTicket(id)

    return Response.json(ticket, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/tickets/[id] error:', error)
    return Response.json(
      { error: 'Failed to deactivate ticket', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const ticket = await reactivateTicket(id)

    return Response.json(ticket, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/tickets/[id] error:', error)
    return Response.json(
      { error: 'Failed to reactivate ticket', message: error.message },
      { status: 500 }
    )
  }
}
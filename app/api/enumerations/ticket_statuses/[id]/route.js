import { 
  getTicketStatusById, 
  updateTicketStatus, 
  deleteTicketStatus 
} from '../../../../../lib/supabase/domains/enumerations/ticketStatuses'

export async function GET(request, { params }) {
  try {
    const { id } = await params()
    const ticketStatus = await getTicketStatusById(id)
    return Response.json(ticketStatus, { status: 200 })
  } catch (error) {
    console.error('GET /api/enumerations/ticketstatuses/[id] error:', error)
    if (error.message.includes('not found')) {
      return Response.json({ error: 'Ticket status not found' }, { status: 404 })
    }
    return Response.json(
      { error: 'Failed to fetch ticket status', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params()
    const data = await request.json()
    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    const ticketStatus = await updateTicketStatus(id, data)
    return Response.json(ticketStatus, { status: 200 })
  } catch (error) {
    console.error('PUT /api/enumerations/ticketstatuses/[id] error:', error)
    return Response.json(
      { error: 'Failed to update ticket status', message: error.message },
      { status: 400 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params()
    const result = await deleteTicketStatus(id)
    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/enumerations/ticketstatuses/[id] error:', error)
    return Response.json(
      { error: 'Failed to delete ticket status', message: error.message },
      { status: 400 }
    )
  }
}

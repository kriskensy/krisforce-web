import { getTicketPriorityById, updateTicketPriority, deleteTicketPriority } from '../../../../../lib/supabase/domains/enumerations/ticket_riorities'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const ticketPriority = await getTicketPriorityById(id)

    if(!ticketPriority) {
      return Response.json(
        { error: 'Address type not found' },
        { status: 404 }
      )
    }

    return Response.json(ticketPriority, { status: 200 })
  } catch (error) {
    console.error('GET /api/enumerations/ticket_priorities/[id] error:', error)
    
    return Response.json(
      { error: 'Failed to fetch ticket priority', message: error.message },
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

    const ticketPriority = await updateTicketPriority(id, data)
    return Response.json(ticketPriority, { status: 200 })
  } catch (error) {
    console.error('PUT /api/enumerations/ticket_priorities/[id] error:', error)
    return Response.json(
      { error: 'Failed to update ticket priority', message: error.message },
      { status: 400 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const result = await deleteTicketPriority(id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/enumerations/ticket_priorities/[id] error:', error)
    return Response.json(
      { error: 'Failed to delete ticket priority', message: error.message },
      { status: 400 }
    )
  }
}

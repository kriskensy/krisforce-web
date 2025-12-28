import { getTicketCommentById, updateTicketComment, deleteTicketComment } from '../../../../../../lib/supabase/domains/tickets/ticket_comments'

export async function GET(request, { params }) {
  try {
    const { id, commentId } = await params
    const comment = await getTicketCommentById(commentId, id)

    return Response.json(comment, { status: 200 })
  } catch (error) {
    console.error('GET /api/tickets/[id]/comments/[commentId] error:', error)
    return Response.json(
      { error: 'Failed to fetch ticket comment', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id, commentId } = await params
    const data = await request.json()
    
    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    if (!data.message) {
      return Response.json(
        { error: 'Validation error', message: 'Comment message required' },
        { status: 400 }
      )
    }

    const comment = await updateTicketComment(commentId, id, data)
    return Response.json(comment, { status: 200 })
  } catch (error) {
    console.error('PUT /api/tickets/[id]/comments/[commentId] error:', error)
    return Response.json(
      { error: 'Failed to update ticket comment', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, commentId } = await params
    const result = await deleteTicketComment(commentId, id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/tickets/[id]/comments/[commentId] error:', error)
    return Response.json(
      { error: 'Failed to delete ticket comment', message: error.message },
      { status: 500 }
    )
  }
}
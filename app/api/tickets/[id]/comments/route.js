import { getTicketComments, createTicketComment } from '@/lib/supabase/domains/tickets/ticket_comments'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      userid: searchParams.get('userid'),
      limit: parseInt(searchParams.get('limit')) || 20,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'created_at',
      orderDir: searchParams.get('order') || 'asc'
    }

    const result = await getTicketComments(id, filters)
    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total.toString()
      }
    })
  } catch (error) {
    console.error('GET /api/tickets/[id]/comments error:', error)
    return Response.json(
      { error: 'Failed to fetch ticket comments', message: error.message },
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

    if (!data.message) {
      return Response.json(
        { error: 'Validation error', message: 'Comment message required' },
        { status: 400 }
      )
    }

    const comment = await createTicketComment(id, data)
    return Response.json(comment, { status: 201 })
  } catch (error) {
    console.error('POST /api/tickets/[id]/comments error:', error)
    return Response.json(
      { error: 'Failed to create ticket comment', message: error.message },
      { status: 500 }
    )
  }
}
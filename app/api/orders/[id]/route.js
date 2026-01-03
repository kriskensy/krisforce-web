import { getOrderById, updateOrder, deactivateOrder, reactivateOrder } from '@/lib/supabase/domains/orders/orders'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const order = await getOrderById(id)

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    return Response.json(order, { status: 200 })
  } catch (error) {
    console.error('GET /api/orders/[id] error:', error)
    return Response.json(
      { error: 'Failed to fetch order', message: error.message },
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
    const order = await updateOrder(id, data)
    
    return Response.json(order, { status: 200 })
  } catch (error) {
    console.error('PUT /api/orders/[id] error:', error)
    return Response.json(
      { error: 'Failed to update order', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const order = await deactivateOrder(id)

    return Response.json(order, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/orders/[id] error:', error)
    return Response.json(
      { error: 'Failed to deactivate order', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const order = await reactivateOrder(id)

    return Response.json(order, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/orders/[id] error:', error)
    return Response.json(
      { error: 'Failed to reactivate order', message: error.message },
      { status: 500 }
    )
  }
}

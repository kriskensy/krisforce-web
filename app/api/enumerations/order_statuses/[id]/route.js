import { getOrderStatusById, updateOrderStatus, deleteOrderStatus } from '../../../../../lib/supabase/domains/enumerations/order_statuses'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const orderStatus = await getOrderStatusById(id)

    if(!orderStatus) {
      return Response.json(
        { error: 'Order status not found' },
        { status: 404 }
      )
    }

    return Response.json(orderStatus, { status: 200 })
  } catch (error) {
    console.error('GET /api/enumerations/order_statuses/[id] error:', error)

    return Response.json(
      { error: 'Failed to fetch order status', message: error.message },
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

    const orderStatus = await updateOrderStatus(id, data)

    return Response.json(orderStatus, { status: 200 })
  } catch (error) {
    console.error('PUT /api/enumerations/order_statuses/[id] error:', error)
    return Response.json(
      { error: 'Failed to update order status', message: error.message },
      { status: 400 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const result = await deleteOrderStatus(id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/enumerations/order_statuses/[id] error:', error)
    return Response.json(
      { error: 'Failed to delete order status', message: error.message },
      { status: 400 }
    )
  }
}

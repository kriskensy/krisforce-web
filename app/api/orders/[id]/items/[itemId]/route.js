import { getOrderItemById, updateOrderItem, deleteOrderItem } from '../../../../../../lib/supabase/domains/orders/order_items'

export async function GET(request, { params }) {
  try {
    const { id, itemId } = await params
    const item = await getOrderItemById(itemId, id)

    return Response.json(item, { status: 200 })
  } catch (error) {
    console.error('GET /api/orders/[id]/items/[itemId] error:', error)
    return Response.json(
      { error: 'Failed to fetch order item', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id, itemId } = await params
    const data = await request.json()
    
    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    const item = await updateOrderItem(itemId, id, data)

    return Response.json(item, { status: 200 })
  } catch (error) {
    console.error('PUT /api/orders/[id]/items/[itemId] error:', error)
    return Response.json(
      { error: 'Failed to update order item', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, itemId } = await params
    const result = await deleteOrderItem(itemId, id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/orders/[id]/items/[itemId] error:', error)
    return Response.json(
      { error: 'Failed to delete order item', message: error.message },
      { status: 500 }
    )
  }
}
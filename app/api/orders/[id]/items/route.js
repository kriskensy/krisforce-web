import { getOrderItems, createOrderItem } from '../../../../../lib/supabase/domains/orders/order_items'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'order_id',
      orderDir: searchParams.get('order') || 'asc'
    }

    const result = await getOrderItems(id, filters)
    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/orders/[id]/items error:', error)
    return Response.json(
      { error: 'Failed to fetch order items', message: error.message },
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

    if (!data.product_id || !data.quantity || !data.unit_price) {
      return Response.json(
        { error: 'Validation error', message: 'Product ID, quantity and unit price required' },
        { status: 400 }
      )
    }

    const item = await createOrderItem(id, data)
    return Response.json(item, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders/[id]/items error:', error)
    return Response.json(
      { error: 'Failed to create order item', message: error.message },
      { status: 500 }
    )
  }
}

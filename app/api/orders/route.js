import { getOrders, createOrder } from '@/lib/supabase/domains/orders/orders'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      activeOnly: searchParams.get('activeOnly') === 'true',
      status: searchParams.get('status'),
      client: searchParams.get('client_id'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'created_at',
      order: searchParams.get('order') || 'desc'
    }

    const result = await getOrders(filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/orders error:', error)
    return Response.json(
      { error: 'Failed to fetch orders', message: error.message },
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
    if (!data.order_number || !data.client_id || !data.status_id) {
      return Response.json(
        { error: 'Validation error', message: 'Order number, client and order status required' },
        { status: 400 }
      )
    }

    const order = await createOrder(data)

    return Response.json(order, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders error:', error)
    return Response.json(
      { error: 'Failed to create order', message: error.message },
      { status: 500 }
    )
  }
}

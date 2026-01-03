import { getOrderShipments, createOrderShipment } from '@/lib/supabase/domains/orders/order_shipments'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      carrier: searchParams.get('carrier'),
      shipped: searchParams.get('shipped'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'shipped_date',
      orderDir: searchParams.get('order') || 'desc'
    }

    const result = await getOrderShipments(id, filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total.toString()
      }
    })
  } catch (error) {
    console.error('GET /api/orders/[id]/shipments error:', error)
    return Response.json(
      { error: 'Failed to fetch order shipments', message: error.message },
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

    if (!data.tracking_number || !data.carrier) {
      return Response.json(
        { error: 'Validation error', message: 'Tracking number and carrier required' },
        { status: 400 }
      )
    }

    const shipment = await createOrderShipment(id, data)
    return Response.json(shipment, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders/[id]/shipments error:', error)
    return Response.json(
      { error: 'Failed to create order shipment', message: error.message },
      { status: 500 }
    )
  }
}

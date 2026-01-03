import { getOrderShipmentById, updateOrderShipment, deleteOrderShipment } from '@/lib/supabase/domains/orders/order_shipments'

export async function GET(request, { params }) {
  try {
    const { id, shipmentId } = await params
    const shipment = await getOrderShipmentById(shipmentId, id)

    return Response.json(shipment, { status: 200 })

  } catch (error) {
    console.error('GET /api/orders/[id]/shipments/[shipmentId] error:', error)
    return Response.json(
      { error: 'Failed to fetch order shipment', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id, shipmentId } = await params
    const data = await request.json()
    
    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    const shipment = await updateOrderShipment(shipmentId, id, data)

    return Response.json(shipment, { status: 200 })
  } catch (error) {
    console.error('PUT /api/orders/[id]/shipments/[shipmentId] error:', error)
    return Response.json(
      { error: 'Failed to update order shipment', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, shipmentId } = await params
    const result = await deleteOrderShipment(shipmentId, id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/orders/[id]/shipments/[shipmentId] error:', error)
    return Response.json(
      { error: 'Failed to delete order shipment', message: error.message },
      { status: 500 }
    )
  }
}
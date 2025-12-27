import { getServerClient } from '../../server'
import { verifyAccessLevel } from '../../../../lib/utils/auth/verifyAccessLevel'
//TODO uncomment access verify
export async function getOrderShipments(orderId, filters) {
  try {
    if (!orderId) throw new Error('Order ID is required')
    // await verifyAccessLevel(1)//support+

    const { 
      search, 
      carrier, 
      shipped, 
      limit = 10, 
      offset = 0, 
      orderBy = 'shipped_date', 
      orderDir = 'desc' 
    } = filters

    const supabase = await getServerClient()

    let query = supabase
      .from('order_shipments')
      .select('id, order_id, tracking_number, carrier, shipped_date', { count: 'exact' })
      .eq('order_id', orderId)

    //tracking number or carrier searching
    if (search) {
      query = query.or(
        `tracking_number.ilike.%${search}%,carrier.ilike.%${search}%`
      )
    }

    //filter by carrier
    if (carrier) {
      query = query.ilike('carrier', `%${carrier}%`)
    }

    //filter shipped/unshipped
    if (shipped === true)
      query = query.not('shipped_date', 'is', null);
    
    if (shipped === false)
      query = query.is('shipped_date', null);

    //sort + pagination
    query = query
      .order(orderBy, { ascending: orderDir === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return { 
      data, 
      total: count || 0, 
      limit, 
      offset 
    }
  } catch (error) {
    console.error('Error fetching order shipments:', error)
    throw error
  }
}

export async function getOrderShipmentById(shipmentId, orderId) {
  try {
    if (!shipmentId || !orderId) throw new Error('Shipment ID and Order ID are required')
    // await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('order_shipments')
      .select('id, order_id, tracking_number, carrier, shipped_date')
      .eq('id', shipmentId)
      .eq('order_id', orderId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Order shipment not found')

    return data
  } catch (error) {
    console.error('Error fetching order shipment:', error)
    throw error
  }
}

export async function createOrderShipment(orderId, shipmentData) {
  try {
    if (!orderId) throw new Error('Order ID is required')
    // await verifyAccessLevel(2)//manager+

    const { tracking_number, carrier, shipped_date } = shipmentData
    
    if (!tracking_number || tracking_number.trim() === '') {
      throw new Error('Tracking number is required')
    }

    if (!carrier || carrier.trim() === '') {
      throw new Error('Carrier is required')
    }

    const supabase = await getServerClient()

    //check if order exists and is not deleted
    const { data: order } = await supabase
      .from('orders')
      .select('id, status_id')
      .eq('id', orderId)
      .is('deleted_at', null)
      .single()
    
    if (!order) throw new Error('Order not found')

    const { data: newShipment, error: insertError } = await supabase
      .from('order_shipments')
      .insert({
        order_id: orderId,
        tracking_number: tracking_number.trim(),
        carrier: carrier.trim(),
        shipped_date: shipped_date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (insertError) throw new Error(`Shipment creation error: ${insertError.message}`)

    return await getOrderShipmentById(newShipment.id, orderId)
  } catch (error) {
    console.error('Error creating order shipment:', error)
    throw error
  }
}

export async function updateOrderShipment(shipmentId, orderId, shipmentData) {
  try {
    if (!shipmentId || !orderId) throw new Error('Shipment ID and Order ID are required')
    // await verifyAccessLevel(2)//manager+

    const { tracking_number, carrier, shipped_date } = shipmentData

    const supabase = await getServerClient()

    //check if shipment exists and belongs to order
    const { data: existing } = await supabase
      .from('order_shipments')
      .select('id, tracking_number')
      .eq('id', shipmentId)
      .eq('order_id', orderId)
      .single()

    if (!existing) throw new Error('Order shipment not found')

    //validate updates
    if (tracking_number !== undefined && (!tracking_number || tracking_number.trim() === '')) {
      throw new Error('Valid tracking number is required')
    }

    if (carrier !== undefined && (!carrier || carrier.trim() === '')) {
      throw new Error('Valid carrier is required')
    }

    const updatePayload = {}
    if (tracking_number !== undefined)
      updatePayload.tracking_number = tracking_number.trim()
    if (carrier !== undefined)
      updatePayload.carrier = carrier.trim()
    if (shipped_date !== undefined)
      updatePayload.shipped_date = shipped_date

    const { error: updateError } = await supabase
      .from('order_shipments')
      .update(updatePayload)
      .eq('id', shipmentId)
      .eq('order_id', orderId)

    if (updateError) throw new Error(`Shipment update error: ${updateError.message}`)

    return await getOrderShipmentById(shipmentId, orderId)
  } catch (error) {
    console.error('Error updating order shipment:', error)
    throw error
  }
}

export async function deleteOrderShipment(shipmentId, orderId) {
  try {
    if (!shipmentId || !orderId) throw new Error('Shipment ID and Order ID are required')
    // await verifyAccessLevel(2, 'manager')

    const supabase = await getServerClient()
    
    const { error: deleteError } = await supabase
      .from('order_shipments')
      .delete()
      .eq('id', shipmentId)
      .eq('order_id', orderId)

    if (deleteError)
      throw new Error(`Shipment deletion error: ${deleteError.message}`)

    return { success: true, message: 'Order shipment deleted successfully' }
  } catch (error) {
    console.error('Error deleting order shipment:', error)
    throw error
  }
}
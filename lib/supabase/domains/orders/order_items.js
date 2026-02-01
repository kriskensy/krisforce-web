import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

export async function getOrderItems(orderId, filters) {
  try {
    await verifyAccessLevel(1)//support+

    const {
      search,
      product_id,
      limit = 10,
      offset = 0,
      orderBy = 'order_id',
      orderDir = 'desc'
    } = filters

    const supabase = await getServerClient()

    let query = supabase
      .from('order_items')
      .select('id, order_id, orders (order_number), quantity, unit_price, total_price, product_id, products (name)', { count: 'exact' })

    //check if orderId is valid (no placeholder [id])
    const isValidUUID = orderId && orderId !== "[id]" && orderId !== "undefined";

    if (isValidUUID)
      query = query.eq('order_id', orderId);

    //search
    if (search) {
      //get orders
      const { data: matchedOrders } = await supabase
        .from('orders')
        .select('id')
        .ilike('order_number', `%${search}%`);

      const matchedOrdersIds = matchedOrders?.map(order => order.id) || [];

      //get products
      const { data: matchedProducts } = await supabase
        .from('products')
        .select('id')
        .ilike('name', `%${search}%`);

      const matchedProductsIds = matchedProducts?.map(product => product.id) || [];

      const searchResultsArray = [];

      if (matchedOrdersIds.length > 0)
        searchResultsArray.push(`order_id.in.(${matchedOrdersIds.join(',')})`);

      if (matchedProductsIds.length > 0)
        searchResultsArray.push(`product_id.in.(${matchedProductsIds.join(',')})`);

      if(searchResultsArray.length > 0 )
        query = query.or(searchResultsArray.join(','));
    }

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
    console.error('Error fetching order items:', error)
    throw error
  }
}

export async function getOrderItemById(itemId, orderId) {
  try {
    if (!itemId || !orderId) throw new Error('Item ID and Order ID are required')
    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('order_items')
      .select('id, order_id, orders (order_number), quantity, unit_price, total_price, product_id, products (name)')
      .eq('id', itemId)
      .eq('order_id', orderId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Order item not found')

    return data
  } catch (error) {
    console.error('Error fetching order item:', error)
    throw error
  }
}

export async function createOrderItem(orderId, itemData) {
  try {
    if (!orderId) throw new Error('Order ID is required')
    await verifyAccessLevel(2)//manager+

    const { product_id, quantity, unit_price } = itemData
    
    if (!product_id) throw new Error('Product ID is required')
    if (!quantity || quantity <= 0) throw new Error('Valid quantity is required')
    if (!unit_price || unit_price < 0) throw new Error('Valid unit price is required')

    const supabase = await getServerClient()

    //check if order exists?
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .is('deleted_at', null)
      .single()
    
    if (!order) throw new Error('Order not found')

    const total_price = quantity * unit_price

    const { data: newItem, error: insertError } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
        product_id: product_id,
        quantity: quantity,
        unit_price: unit_price,
        total_price: total_price
      })
      .select()
      .single()

    if (insertError) throw new Error(`Order item creation error: ${insertError.message}`)

    return await getOrderItemById(newItem.id, orderId)
  } catch (error) {
    console.error('Error creating order item:', error)
    throw error
  }
}

export async function updateOrderItem(itemId, orderId, itemData) {
  try {
    if (!itemId || !orderId) throw new Error('Item ID and Order ID are required')
    await verifyAccessLevel(2)//manager+

    const { product_id, quantity, unit_price } = itemData

    const supabase = await getServerClient()

    //check if item exists and belongs to order?
    const { data: existing } = await supabase
      .from('order_items')
      .select('id, quantity, unit_price')
      .eq('id', itemId)
      .eq('order_id', orderId)
      .single()

    if (!existing) throw new Error('Order item not found')

    //validate updates
    if (quantity !== undefined && quantity <= 0)
      throw new Error('Valid quantity is required')

    if (unit_price !== undefined && unit_price < 0)
      throw new Error('Valid unit price is required')

    const updatePayload = {}

    if (product_id)
      updatePayload.product_id = product_id

    if (quantity !== undefined)
      updatePayload.quantity = quantity

    if (unit_price !== undefined)
      updatePayload.unit_price = unit_price

    updatePayload.total_price = (updatePayload.quantity || existing.quantity) * (updatePayload.unit_price || existing.unit_price)

    const { error: updateError } = await supabase
      .from('order_items')
      .update(updatePayload)
      .eq('id', itemId)
      .eq('order_id', orderId)

    if (updateError) throw new Error(`Order item update error: ${updateError.message}`)

    return await getOrderItemById(itemId, orderId)
  } catch (error) {
    console.error('Error updating order item:', error)
    throw error
  }
}

export async function deleteOrderItem(itemId, orderId) {
  try {
    if (!itemId || !orderId) throw new Error('Item ID and Order ID are required')
    await verifyAccessLevel(2, 'manager')

    const supabase = await getServerClient()
    
    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('id', itemId)
      .eq('order_id', orderId)

    if (deleteError)
      throw new Error(`Order item deletion error: ${deleteError.message}`)

    return { success: true, message: 'Order item deleted successfully' }
  } catch (error) {
    console.error('Error deleting order item:', error)
    throw error
  }
}
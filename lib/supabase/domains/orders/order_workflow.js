import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

export async function getOrderWorkflow(orderId, filters) {
  try {
    await verifyAccessLevel(1)//support+

    const { 
      search, 
      status, 
      limit = 10, 
      offset = 0, 
      orderBy = 'changed_at', 
      orderDir = 'desc' 
    } = filters

    const supabase = await getServerClient()

    let query = supabase
      .from('order_workflow')
      .select('id, order_id, orders (order_number), old_status_id, old_status:order_statuses!old_status_id(code, name), new_status_id, new_status:order_statuses!new_status_id(code, name), changed_at', { count: 'exact' })

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

      if (matchedOrdersIds.length > 0)
        query = query.in('order_id', matchedOrdersIds); //in because only records from these oredrs
    }
    
    //filter by new status
    if (status) {
      query = query.eq('new_status_id', status)
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
    console.error('Error fetching order workflow:', error)
    throw error
  }
}

export async function getOrderWorkflowById(workflowId, orderId) {
  try {
    if (!workflowId || !orderId) throw new Error('Workflow ID and Order ID are required')
    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('order_workflow')
      .select('id, order_id, old_status_id, old_status:order_statuses!old_status_id(code, name), new_status_id, new_status:order_statuses!new_status_id(code, name), changed_at')
      .eq('id', workflowId)
      .eq('order_id', orderId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data)
      throw new Error('Order workflow record not found')

    return data
  } catch (error) {
    console.error('Error fetching order workflow record:', error)
    throw error
  }
}

export async function updateOrderStatus(orderId, statusCode) {
  try {
    if (!orderId || !statusCode) throw new Error('Order ID and Status Code are required')

    await verifyAccessLevel(2)//support+

    const supabase = await getServerClient()

    //SQL procedure RPC via bridge function
    const { error } = await supabase.rpc('call_update_order_status', {
      p_order_id: orderId,
      p_new_status_code: statusCode
    })

    if (error) throw new Error(`Database error: ${error.message}`)

    return { success: true, message: `Order status changed to ${statusCode}` }
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

export async function deleteOrderWorkflow(workflowId, orderId) {
  try {
    if (!workflowId || !orderId) throw new Error('Workflow ID and Order ID are required')
    await verifyAccessLevel(3) //admin

    const supabase = await getServerClient()
    
    const { error: deleteError } = await supabase
      .from('order_workflow')
      .delete()
      .eq('id', workflowId)
      .eq('order_id', orderId)

    if (deleteError)
      throw new Error(`Workflow deletion error: ${deleteError.message}`)

    return { success: true, message: 'Order workflow record deleted successfully' }
  } catch (error) {
    console.error('Error deleting order workflow:', error)
    throw error
  }
}
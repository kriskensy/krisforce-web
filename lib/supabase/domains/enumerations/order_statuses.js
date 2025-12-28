import { getServerClient } from '../../server'
import { verifyAccessLevel } from '../../../utils/auth/verifyAccessLevel'

export async function getOrderStatuses(filters) {
  try {
    const {
      search,
      active,
      limit = 10,
      offset = 0,
      orderBy = 'code',
      orderDir = 'asc'
    } = filters

    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    let query = supabase
      .from('order_statuses')
      .select('id, code, name, active', {count: 'exact'})

    //search name, code
    if (search) {
      query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`)
    }

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
    console.error('Error fetching order statuses:', error)
    throw error
  }
}

export async function getOrderStatusById(id) {
  try {
    if (!id) throw new Error('Order status ID is required')

    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()
    
    let { data, error } = await supabase
      .from('order_statuses')
      .select('id, code, name, active')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Order status not found')

    return data
  } catch (error) {
    console.error('Error fetching order status:', error)
    throw error
  }
}

export async function createOrderStatus(orderStatusData) {
  try {
    await verifyAccessLevel(3)//admin

    const { code, name } = orderStatusData

    if (!code || code.trim() === '') throw new Error('Order status code is required')
    if (!name || name.trim() === '') throw new Error('Order status name is required')

    const supabase = await getServerClient()

    //check is code unique?
    const { data: existingCode } = await supabase
      .from('order_statuses')
      .select('id')
      .eq('code', code.trim().toLowerCase())
      .maybeSingle()

    if (existingCode)
      throw new Error('Order status code already exists')

    const { data: newStatus, error: insertError } = await supabase
      .from('order_statuses')
      .insert({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        active: true
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Order status creation error: ${insertError.message}`)

    return await getOrderStatusById(newStatus.id)
  } catch (error) {
    console.error('Error creating order status:', error)
    throw error
  }
}

export async function updateOrderStatus(id, orderStatusData) {
  try {
    if (!id) throw new Error('Order status ID is required')

    await verifyAccessLevel(3)//admin

    const { code, name, active } = orderStatusData
    const supabase = await getServerClient()

    const { data: existingOrderStatus } = await supabase
      .from('order_statuses')
      .select('id, code')
      .eq('id', id)
      .single()

    if (!existingOrderStatus) throw new Error('Order status not found')

    //check is code unique?
    if (code && code.trim().toLowerCase() !== existingOrderStatus.code) {
      const { data: codeExists } = await supabase
        .from('order_statuses')
        .select('id')
        .eq('code', code.trim().toLowerCase())
        .neq('id', id)
        .maybeSingle()

      if (codeExists)
        throw new Error('Order status code already exists')
    }

    const updatePayload = {}
    if (code !== undefined) updatePayload.code = code.trim().toLowerCase()
    if (name !== undefined) updatePayload.name = name.trim()
    if (active !== undefined) updatePayload.active = active

    const { error: updateError } = await supabase
      .from('order_statuses')
      .update(updatePayload)
      .eq('id', id)

    if (updateError)
      throw new Error(`Order status update error: ${updateError.message}`)

    return await getOrderStatusById(id)
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

export async function deleteOrderStatus(id) {
  try {
    if (!id) throw new Error('Order status ID is required')

    await verifyAccessLevel(3)//admin

    const supabase = await getServerClient()

    //check if order status in use
    const { count: orderStatusUsageCount, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status_id', id)
      .is('deleted_at', null)

    //check usage in orderworkflow
    const { count: workflowUsageCount, error: workflowError } = await supabase
      .from('order_workflow')
      .select('*', { count: 'exact', head: true })
      .or(`old_status_id.eq.${id}, new_status_id.eq.${id}`)

    if (ordersError || workflowError)
      throw new Error('Usage check error')

    if (orderStatusUsageCount > 0)
      throw new Error(`Cannot delete order status used in ${orderStatusUsageCount} orders`)

    if (workflowUsageCount > 0)
      throw new Error(`Cannot delete order status used in ${workflowUsageCount} workflow records`)

    const { error } = await supabase
      .from('order_statuses')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Order status deletion error: ${error.message}`)

    return { success: true, message: 'Order status deleted successfully' }
  } catch (error) {
    console.error('Error deleting order status:', error)
    throw error
  }
}

import { getServerClient } from '../../server'
import { verifyAccessLevel } from '../../../utils/auth/verifyAccessLevel'
import { createClient as createAdminClient } from '@supabase/supabase-js'
//TODO uncomment access verify
export async function getOrders(filters) {
  try {
    const {
      search,
      status,
      client,
      order,
      limit = 10,
      offset = 0,
      orderBy = 'name',
      orderDir = 'desc'
    } = filters

    // await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()
    let query = supabase
      .from('orders')
      .select('id, order_number, order_date, total_amount, status_id, client_id, orders_client_id_fkey (name), created_by, created_at, deleted_at', { count: 'exact' })
      .is('deleted_at', null)

    //order number or client name searching
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,orders_client_id_fkey.name.ilike.%${search}%`)
    }

    //filters
    if (status) query.eq('status_id', status)
    if (client) query.eq('client_id', client)

    //sort + pagination
    query = query
      .order(orderBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    //created_by names
    const orders = data
    const creatorIds = [...new Set(orders.map(o => o.createdby).filter(Boolean))]

    let profilesByUserId = {}

    if (creatorIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', creatorIds)

      if (profilesError && profilesError.code !== 'PGRST116')
        throw new Error(profilesError.message)

      profiles?.forEach(profile => {
        const fullName = profile.firstname && profile.lastname 
          ? `${profile.firstname} ${profile.lastname}`.trim() 
          : null

        profilesByUserId[profile.userid] = fullName
      })
    }

    const extended = orders.map(order => ({
      ...order,
      createdbyname: profilesByUserId[order.createdby] || null
    }))

    return { 
      data: extended, 
      total: count || 0, 
      limit, 
      offset 
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

export async function getOrderById(id) {
  try {
    if (!id) throw new Error('Order ID is required')

    // await verifyAccessLevel(1) //support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, order_date, total_amount, status_id, client_id, orders_client_id_fkey (name), created_by, created_at, deleted_at')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Order not found')

    //created_by name
    let createdByName = null

    if (data.createdby) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('user_id', data.createdby)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116')
        throw new Error(profileError.message)

      if (profile) {
        createdByName = profile.firstname && profile.lastname 
          ? `${profile.firstname} ${profile.lastname}`.trim() 
          : null
      }
    }

    return { ...data, createdbyname: createdByName }
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

export async function createOrder(orderData) {
  try {
    // await verifyAccessLevel(2)//manager+
    const { order_number, client_id, order_date, status_id, order_items, ...rest } = orderData

    if (!order_number) throw new Error('Order number is required')
    if (!client_id) throw new Error('Client ID is required')

    const supabase = await getServerClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user)
      throw new Error('Could not identify current user')

    //check if number unique
    const { data: existingNumber } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', order_number)
      // .is('deleted_at', null)
      .maybeSingle()

    if (existingNumber)
      throw new Error('Order number already exists')

    //insert order
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert({
        order_number,
        client_id,
        order_date: order_date || new Date().toISOString().split('T')[0],
        status_id,
        total_amount: orderData.total_amount,
        created_by: null,
        // created_by: user.user.id,
        ...rest
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Order creation error: ${insertError.message}`)

    //insert order items
    if (order_items && order_items.length > 0) {
      const itemsWithOrderId = order_items.map(item => ({
        ...item,
        orderid: newOrder.id
      }))
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId)

      if (itemsError)
        console.warn('Order items insert warning:', itemsError.message)
    }

    return await getOrderById(newOrder.id)
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

export async function updateOrder(orderId, orderData) {
  try {
    if (!orderId) throw new Error('Order ID is required')

    // await verifyAccessLevel(2);//manager+

    const supabase = await getServerClient()

    const { data: existing, error: selectError } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('id', orderId)
      .is('deleted_at', null)
      .single()

    if (selectError && selectError.code !== 'PGRST116')
      throw new Error(selectError.message);

    if (!existing) throw new Error('Order not found')

    //check is order number unique?
    const order_number = orderData.number

    if (order_number && order_number !== existing.order_number) {
      const { data: numberExists } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', order_number)
        .is('deleted_at', null)
        .neq('id', orderId)
        .maybeSingle()

      if (numberExists)
        throw new Error('Order number already exists')
    }

    const updatePayload = { ...orderData }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)

    if (updateError)
      throw new Error(`Order update error: ${updateError.message}`)

    if (orderData.order_items) {
      await supabase.from('order_items').delete().eq('order_id', orderId)
      if (orderData.order_items.length > 0) {
        const itemsWithOrderId = orderData.order_items.map(item => ({
          ...item,
          orderid: orderId
        }))
        await supabase.from('order_items').insert(itemsWithOrderId)
      }
    }

    return await getOrderById(orderId)
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

//DELETE soft delete
export async function deactivateOrder(id) {
  try {
    if (!id) throw new Error('Order ID is required')

    // await verifyAccessLevel(2); //manager +

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return await getOrderById(id)
  } catch (error) {
    console.error('Error deactivating order:', error)
    throw error
  }
}

//PATCH reactivate
export async function reactivateOrder(id) {
  try {
    if (!id) throw new Error('Order ID is required')

    // await verifyAccessLevel(2); //manager +

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('orders')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return await getOrderById(id)
  } catch (error) {
    console.error('Error reactivating order:', error)
    throw error
  }
}
import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

export async function getPriceLists(filters) {
  try {
    const {
      search,
      activeOnly,
      category,
      limit = 10,
      offset = 0,
      orderBy = 'valid_to',
      orderDir = 'asc'
    } = filters

    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    let query = supabase
      .from('price_lists')
      .select('id, name, valid_from, valid_to, deleted_at', { count: 'exact' })

    //filter active only
		if (activeOnly)
		  query = query.is('deleted_at', null)

    //name searching
    if (search) {
      query = query.ilike('name', `%${search}%`)
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
    console.error('Error fetching price lists:', error)
    throw error
  }
}

export async function getPriceListById(id) {
  try {
    if (!id) throw new Error('Price list ID is required')

    await verifyAccessLevel(1) //support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('price_lists')
      .select('id, name, valid_from, valid_to, deleted_at')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Price list not found')

    return data
  } catch (error) {
    console.error('Error fetching price list:', error)
    throw error
  }
}

export async function createPriceList(priceListData) {
  try {
    await verifyAccessLevel(2)//manager+
    const { name, valid_from, valid_to, price_list_items } = priceListData

    if (!name) throw new Error('Price list name is required')
    if (new Date(valid_from) > new Date(valid_to))
      throw new Error('Start date cannot be after end date')

    const supabase = await getServerClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user)
      throw new Error('Could not identify current user')

    const { data: newPriceList, error: insertError } = await supabase
      .from('price_lists')
      .insert({
        name,
        valid_from,
        valid_to,
        deleted_at: null
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Price list creation error: ${insertError.message}`)

    if (price_list_items && price_list_items.length > 0) {
      const itemsWithPriceListId = price_list_items.map(item => ({
        ...item,
        pricelistid: newPriceList.id
      }))

      const { error: itemsError } = await supabase
        .from('price_list_items')
        .insert(itemsWithPriceListId)

      if (itemsError)
        console.warn('Price list items insert warning:', itemsError.message)
    }

    return await getPriceListById(newPriceList.id)

  } catch (error) {
    console.error('Error creating price list:', error)
    throw error
  }
}

export async function updatePriceList(priceListId, priceListData) {
  try {
    if (!priceListId) throw new Error('Price list ID is required')
    await verifyAccessLevel(2);

    const { name, valid_from, valid_to, price_list_items } = priceListData
    const supabase = await getServerClient()

    const { data: existing, error: selectError } = await supabase
      .from('price_lists')
      .select('id, valid_from, valid_to')
      .eq('id', priceListId)
      .single()

    if (selectError || !existing) throw new Error('Price list not found')

    //validate dates
    const finalStart = valid_from || existing.valid_from;
    const finalEnd = valid_to || existing.valid_to;

    if (finalStart && finalEnd && new Date(finalStart) > new Date(finalEnd)) {
      throw new Error('Start date cannot be after end date')
    }

    const updatePayload = {}
    if (name !== undefined) updatePayload.name = name
    if (valid_from !== undefined) updatePayload.valid_from = valid_from
    if (valid_to !== undefined) updatePayload.valid_to = valid_to

    const { error: updateError } = await supabase
      .from('price_lists')
      .update(updatePayload)
      .eq('id', priceListId)

    if (updateError) throw new Error(`Price list update error: ${updateError.message}`)

    //updtae price list items
    if (price_list_items) {
      await supabase
        .from('price_list_items')
        .delete()
        .eq('price_list_id', priceListId)

      if (price_list_items.length > 0) {
        const itemsWithPriceListId = price_list_items.map(item => ({
          ...item,
          price_list_id: priceListId
        }))
        
        const { error: itemsError } = await supabase
          .from('price_list_items')
          .insert(itemsWithPriceListId)
          
        if (itemsError) console.warn('Items update error:', itemsError.message)
      }
    }

    return await getPriceListById(priceListId)

  } catch (error) {
    console.error('Error updating price list:', error)
    throw error
  }
}

// DELETE soft delete
export async function deactivatePriceList(id) {
  try {
    if (!id) throw new Error('Price list ID is required')

    await verifyAccessLevel(2); //manager +

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('price_lists')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error)
      throw new Error(error.message)

    return await getPriceListById(id)
  } catch (error) {
    console.error('Error deactivating price list:', error)
    throw error
  }
}

// PATCH reactivate
export async function reactivatePriceList(id) {
  try {
    if (!id) throw new Error('Price list ID is required')

    await verifyAccessLevel(2); //manager +

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('price_lists')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error)
      throw new Error(error.message)

    return await getPriceListById(id)
  } catch (error) {
    console.error('Error reactivating price list:', error)
    throw error
  }
}
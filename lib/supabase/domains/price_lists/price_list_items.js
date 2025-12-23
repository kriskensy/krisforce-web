import { getServerClient } from '../../server'
import { verifyAccessLevel } from '../../../utils/auth/verifyAccessLevel'
//TODO uncomment access verify
export async function getPriceListItems(filters) {
  try {
    const {
      search,
      price_list_id,
      product_id,
      limit = 10,
      offset = 0,
      orderBy = 'deleted_at',
      orderDir = 'desc'
    } = filters

    // await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    let query = supabase
      .from('price_list_items')
      .select('id, price_list_id, product_id, products (name), price, deleted_at', { count: 'exact' })
      .is('deleted_at', null) //exclude soft deleted

    //filter price_list_id
    if (price_list_id) {
      query = query.eq('price_list_id', price_list_id)
    }

    //filter product_id
    if (product_id) {
      query = query.eq('product_id', product_id)
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
    console.error('Error fetching price list items:', error)
    throw error
  }
}

export async function getPriceListItemById(itemid) {
  try {
    if (!itemid) throw new Error('Price list item ID is required')

    // await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('price_list_items')
      .select('id, price_list_id, product_id, products (name), price, deleted_at')
      .eq('id', itemid)
      .is('deleted_at', null)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data)
      throw new Error('Price list item not found')

    return data
  } catch (error) {
    console.error('Error fetching price list item:', error)
    throw error
  }
}

export async function createPriceListItem(itemData) {
  try {
    // await verifyAccessLevel(2)//manager+

    const { price_list_id, product_id, price } = itemData

    if (!price_list_id) throw new Error('Price list ID is required')
    if (!product_id) throw new Error('Product ID is required')
    if (!price || price < 0) throw new Error('Price must be >= 0')

    const supabase = await getServerClient()

    //check price list exists
    const { data: priceList } = await supabase
      .from('price_lists')
      .select('id')
      .eq('id', price_list_id)
      .is('deleted_at', null)
      .maybeSingle()

    if (!priceList)
      throw new Error('Price list not found or is deleted')

    //check product exits
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .is('deleted_at', null)
      .maybeSingle()

    if (!product)
      throw new Error('Product not found or is deleted')

    const { data: newItem, error: insertError } = await supabase
      .from('price_list_items')
      .insert({
        price_list_id,
        product_id,
        price,
        deleted_at: null
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Price list item creation error: ${insertError.message}`)

    return await getPriceListItemById(newItem.id)
  } catch (error) {
    console.error('Error creating price list item:', error)
    throw error
  }
}

export async function updatePriceListItem(id, itemData) {
  try {
    if (!id) throw new Error('Price list item ID is required')

    // await verifyAccessLevel(2)//manager+

    const { price_list_id, product_id, price } = itemData

    const supabase = await getServerClient()

    const { data: existing } = await supabase
      .from('price_list_items')
      .select('id, price_list_id, product_id, price, deleted_at')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()

    if (!existing)
      throw new Error('Price list item not found')

    const updatePayload = {}
    if (price_list_id !== undefined) updatePayload.price_list_id = price_list_id
    if (product_id !== undefined) updatePayload.product_id = product_id
    if (price !== undefined && price >= 0) updatePayload.price = price

    const { error: updateError } = await supabase
      .from('price_list_items')
      .update(updatePayload)
      .eq('id', id)

    if (updateError) throw new Error(`Price list item update error: ${updateError.message}`)

    return await getPriceListItemById(id)
  } catch (error) {
    console.error('Error updating price list item:', error)
    throw error
  }
}

//DELETE - soft delete / deactivate
export async function deactivatePriceListItem(id) {
  try {
    if (!id) throw new Error('Price list item ID is required')

    // await verifyAccessLevel(2)//manager+

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('price_list_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(`Price list item deletion error: ${error.message}`)

    return { success: true, message: 'Price list item deleted successfully' }
  } catch (error) {
    console.error('Error deleting price list item:', error)
    throw error
  }
}

//PATCH - reactivate
export async function reactivatePriceListItem(id) {
  try {
    if (!id) throw new Error('Price list item ID is required')

    // await verifyAccessLevel(2)//manager+

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('price_list_items')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) throw new Error(`Price list item reactivation error: ${error.message}`)

    return await getPriceListItemById(id)
  } catch (error) {
    console.error('Error reactivating price list item:', error)
    throw error
  }
}

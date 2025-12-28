import { getServerClient } from '../../server'
import { verifyAccessLevel } from '../../../utils/auth/verifyAccessLevel'

export async function getProducts(filters = {}) {
  try {
    const {
      search,
      category,
      limit = 10,
      offset = 0,
      orderBy = 'name',
      orderDir = 'desc'
    } = filters

    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    let query = supabase
      .from('products')
      .select('id, code, name, category_id, product_categories (code, name), standard_price, deleted_at', { count: 'exact' })
      .is('deleted_at', null) //exclude soft deleted

    //name or code searching
    if (search) {
      query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`)
    }

    //filters
    if (category) query.eq('category_id', category)

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
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function getProductById(id) {
  try {
    if (!id) throw new Error('Product ID is required')

    await verifyAccessLevel(1) //support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('products')
      .select('id, code, name, category_id, product_categories (code, name), standard_price, deleted_at')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Product not found')

    return data
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

export async function createProduct(productData) {
  try {
    await verifyAccessLevel(2)//manager+
    const { code, name, category_id, standard_price } = productData

    if (!code) throw new Error('Product code is required')
    if (!name) throw new Error('Product name is required')
    if (!category_id) throw new Error('Product category is required')
    if (!standard_price || standard_price < 0)
      throw new Error('Valid standard price is required')

    const supabase = await getServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user)
      throw new Error('Could not identify current user')

    //check is product code unique?
    const { data: existingCode } = await supabase
      .from('products')
      .select('id')
      .eq('code', code.trim().toLowerCase())
      .maybeSingle()

    if (existingCode)
      throw new Error('Product code already exists')

    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        category_id,
        standard_price,
        deleted_at: null
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Product creation error: ${insertError.message}`)

    return await getProductById(newProduct.id)
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

export async function updateProduct(productId, productData) {
  try {
    if (!productId) throw new Error('Product ID is required')

    await verifyAccessLevel(2);//manager+

    const supabase = await getServerClient()

    const { data: existing, error: selectError} = await supabase
      .from('products')
      .select('id, code')
      .eq('id', productId)
      .is('deleted_at', null)
      .maybeSingle()

    if (selectError && selectError.code !== 'PGRST116')
      throw new Error(selectError.message);

    if (!existing)
      throw new Error('Product not found')

    //check is product code unique?
    const code = productData.code
    if(code && code.trim().toLowerCase() !== existing.code) {
    const { data: existingCode } = await supabase
      .from('products')
      .select('id')
      .eq('code', code.trim().toLowerCase())
      .neq('id', productId)
      .is('deleted_at', null)
      .maybeSingle()

    if (existingCode)
      throw new Error('Product code already exists')
  }

    const { error: updateError } = await supabase
      .from('products')
      .update({ ...productData })
      .eq('id', productId)

    if (updateError)
      throw new Error(`Product update error: ${updateError.message}`)

    return await getProductById(productId)
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

//DELETE - soft delete / deactivate
export async function deactivateProduct(id) {
  try {
    if (!id) throw new Error('Product ID is required')

    await verifyAccessLevel(2); //manager +

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return await getProductById(id)
  } catch (error) {
    console.error('Error deactivating product:', error)
    throw error
  }
}

//PATCH - reactivate
export async function reactivateProduct(id) {
  try {
    if (!id) throw new Error('Product ID is required')

    await verifyAccessLevel(2); //manager +

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('products')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return await getProductById(id)
  } catch (error) {
    console.error('Error reactivating product:', error)
    throw error
  }
}
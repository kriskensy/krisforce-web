import { getServerClient } from '../../server'
import { verifyAccessLevel } from '../../../utils/auth/verifyAccessLevel'
//TODO uncomment access verify
export async function getproduct_categories(filters) {
  try {
    const {
      search,
      active,
      limit = 10,
      offset = 0,
      orderBy = 'code',
      orderDir = 'asc'
    } = filters

    // await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    let query = supabase
      .from('product_categories')
      .select('id, code, name, active', { count: 'exact' })

    //search name, code
    if (search) {
      query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`)
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
    console.error('Error fetching product categories:', error)
    throw error
  }
}

export async function getProductCategoryById(id) {
  try {
    if (!id) throw new Error('Product category ID is required')

    // await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()
    
    let { data, error } = await supabase
      .from('product_categories')
      .select('id, code, name, active')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') 
      throw new Error(error.message)

    if (!data) throw new Error('Product category not found')

    return data
  } catch (error) {
    console.error('Error fetching product category:', error)
    throw error
  }
}

export async function createProductCategory(productCategoryData) {
  try {
    // await verifyAccessLevel(3)//admin
    const { code, name } = productCategoryData

    if (!code || code.trim() === '') throw new Error('Product category code is required')
    if (!name || name.trim() === '') throw new Error('Product category name is required')

    const supabase = await getServerClient()

    //check is code unique?
    const { data: existingProductCategoryCode } = await supabase
      .from('product_categories')
      .select('id')
      .eq('code', code.trim().toLowerCase())
      .maybeSingle()

    if (existingProductCategoryCode)
      throw new Error('Product category code already exists')

    const { data: newCategory, error: insertError } = await supabase
      .from('product_categories')
      .insert({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        active: true
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Product category creation error: ${insertError.message}`)

    return await getProductCategoryById(newCategory.id)
  } catch (error) {
    console.error('Error creating product category:', error)
    throw error
  }
}

export async function updateProductCategory(id, productCategoryData) {
  try {
    if (!id) throw new Error('Product category ID is required')

    // await verifyAccessLevel(3)//admin

    const { code, name, active } = productCategoryData
    const supabase = await getServerClient()

    const { data: existingProductCategory } = await supabase
      .from('product_categories')
      .select('id, code')
      .eq('id', id)
      .single()

    if (!existingProductCategory) throw new Error('Product category not found')

    //check is code unique?
    if (code && code.trim().toLowerCase() !== existingProductCategory.code) {
      const { data: codeExists } = await supabase
        .from('product_categories')
        .select('id')
        .eq('code', code.trim().toLowerCase())
        .neq('id', id)
        .maybeSingle()

      if (codeExists)
        throw new Error('Product category code already exists')
    }

    const updatePayload = {}
    if (code !== undefined) updatePayload.code = code.trim().toLowerCase()
    if (name !== undefined) updatePayload.name = name.trim()
    if (active !== undefined) updatePayload.active = active

    const { error: updateError } = await supabase
      .from('product_categories')
      .update(updatePayload)
      .eq('id', id)

    if (updateError)
      throw new Error(`Product category update error: ${updateError.message}`)

    return await getProductCategoryById(id)
  } catch (error) {
    console.error('Error updating product category:', error)
    throw error
  }
}

export async function deleteProductCategory(id) {
  try {
    if (!id) throw new Error('Product category ID is required')

    // await verifyAccessLevel(3)//admin

    const supabase = await getServerClient()

    const { count: productsCategoryUsageCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('categoryid', id)
      .is('deleted_at', null)

    // Check usage in pricelistitems (indirect through products)
    if (productsError)
      throw new Error(`Usage check error: ${productsError.message}`)

    if (productsCategoryUsageCount > 0)
      throw new Error(`Cannot delete product category used in ${productsCategoryUsageCount} products`)

    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Product category deletion error: ${error.message}`)

    return { success: true, message: 'Product category deleted successfully' }
  } catch (error) {
    console.error('Error deleting product category:', error)
    throw error
  }
}
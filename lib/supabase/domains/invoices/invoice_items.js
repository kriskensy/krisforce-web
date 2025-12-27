import { getServerClient } from '../../server'
import { verifyAccessLevel } from '../../../../lib/utils/auth/getUserAccessLevel'
//TODO uncomment access verify

export async function getInvoiceItems(invoice_id, filters) {
  try {
    if (!invoice_id) throw new Error('Invoice ID is required')
    // await verifyAccessLevel(1)//support+

    const {
      search,
      limit = 10,
      offset = 0,
      orderBy = 'invoice_id',
      orderDir = 'desc'
    } = filters
    
    const supabase = await getServerClient()

    let query = supabase
      .from('invoice_items')
      .select('id, invoice_id, description, quantity, unit_price, total_price', { count: 'exact' })
      .eq('invoice_id', invoice_id)

    //search by description
    if (search) {
      query = query.ilike('description', `%${search}%`)
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
    console.error('Error fetching invoice items:', error)
    throw error
  }
}

export async function getInvoiceItemById(itemId, invoice_id) {
  try {
    if (!itemId || !invoice_id) throw new Error('Item ID and Invoice ID are required')
    // await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('invoice_items')
      .select('id, invoice_id, description, quantity, unit_price, total_price')
      .eq('id', itemId)
      .eq('invoice_id', invoice_id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Invoice item not found')

    return data
  } catch (error) {
    console.error('Error fetching invoice item:', error)
    throw error
  }
}

export async function createInvoiceItem(invoice_id, itemData) {
  try {
    if (!invoice_id) throw new Error('Invoice ID is required')
    // await verifyAccessLevel(2)//manager+

    const { description, quantity, unit_price } = itemData
    
    if (!description || description.trim() === '') throw new Error('Description is required')
    if (!quantity || quantity <= 0) throw new Error('Valid quantity is required')
    if (!unit_price || unit_price < 0) throw new Error('Valid unit price is required')

    const supabase = await getServerClient()

    //check if invoice exists and not deleted/paid
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, status_id, status:invoice_statuses!status_id (code)')//alias "status"
      .eq('id', invoice_id)
      .is('deleted_at', null)
      .single()
    
    if (invoiceError || !invoice)
      throw new Error('Invoice not found')

    if (invoice.status?.code === 'paid')
      throw new Error('Cannot modify paid invoice')

    const { data: newItem, error: insertError } = await supabase
      .from('invoice_items')
      .insert({
        invoice_id: invoice_id,
        description: description.trim(),
        quantity,
        unit_price
      })
      .select()
      .single()

    if (insertError) throw new Error(`Invoice item creation error: ${insertError.message}`)

    return await getInvoiceItemById(newItem.id, invoice_id)
  } catch (error) {
    console.error('Error creating invoice item:', error)
    throw error
  }
}

export async function updateInvoiceItem(itemId, invoice_id, itemData) {
  try {
    if (!itemId || !invoice_id) throw new Error('Item ID and Invoice ID are required')
    // await verifyAccessLevel(2)//manager+

    const { description, quantity, unit_price } = itemData

    const supabase = await getServerClient()

    //check if item exists and belongs to invoice
    const { data: existing } = await supabase
      .from('invoice_items')
      .select('id, quantity, unit_price')
      .eq('id', itemId)
      .eq('invoice_id', invoice_id)
      .single()

    if (!existing) throw new Error('Invoice item not found')

    //check if invoice exists and not deleted/paid
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, status_id, status:invoice_statuses!status_id (code)')//alias "status"
      .eq('id', invoice_id)
      .is('deleted_at', null)
      .single()
    
    if (invoiceError || !invoice)
      throw new Error('Invoice not found')

    if (invoice.status?.code === 'paid')
      throw new Error('Cannot modify paid invoice')

    if (quantity !== undefined && quantity <= 0)
      throw new Error('Valid quantity is required')

    if (unit_price !== undefined && unit_price < 0)
      throw new Error('Valid unit price is required')

    const updatePayload = { description: description?.trim() }
    if (quantity !== undefined) updatePayload.quantity = quantity
    if (unit_price !== undefined) updatePayload.unit_price = unit_price
    updatePayload.total_price = (updatePayload.quantity || existing.quantity) * (updatePayload.unit_price || existing.unit_price)

    const { error: updateError } = await supabase
      .from('invoice_items')
      .update(updatePayload)
      .eq('id', itemId)
      .eq('invoice_id', invoice_id)

    if (updateError) throw new Error(`Invoice item update error: ${updateError.message}`)

    return await getInvoiceItemById(itemId, invoice_id)
  } catch (error) {
    console.error('Error updating invoice item:', error)
    throw error
  }
}

export async function deleteInvoiceItem(itemId, invoice_id) {
  try {
    if (!itemId || !invoice_id) throw new Error('Item ID and Invoice ID are required')
    // await verifyAccessLevel(2, 'manager')

    const supabase = await getServerClient()
    
    //check if invoice exists and not deleted/paid
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, status_id, status:invoice_statuses!status_id (code)')//alias "status"
      .eq('id', invoice_id)
      .is('deleted_at', null)
      .single()
    
    if (invoiceError || !invoice)
      throw new Error('Invoice not found')

    if (invoice.status?.code === 'paid')
      throw new Error('Cannot modify paid invoice')

    const { error: deleteError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('id', itemId)
      .eq('invoice_id', invoice_id)

    if (deleteError)
      throw new Error(`Invoice item deletion error: ${deleteError.message}`)

    return { success: true, message: 'Invoice item deleted successfully' }
  } catch (error) {
    console.error('Error deleting invoice item:', error)
    throw error
  }
}
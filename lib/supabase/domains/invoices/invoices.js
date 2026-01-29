import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

export async function getInvoices(filters) {
  try {
    const {
      search,
      activeOnly,
      status_code,
      client,
      order,
      limit = 10,
      offset = 0,
      orderBy = 'created_at',
      orderDir = 'desc'
    } = filters

    if(!client) {
      await verifyAccessLevel(1)//support+
    } else {
      await verifyAccessLevel(0);
    }

    const supabase = await getServerClient()

    const dataSource = client ? 'report_invoices' : 'invoices'

    let query = supabase
      .from(dataSource)
      .select(
        client ? '*' : 'id, invoice_number, invoice_date, due_date, total_amount, paid_amount, status_id, invoice_statuses (name), client_id, clients (name), order_id, orders (order_number), created_at, deleted_at', { count: 'exact' })

    //filter active only
		if (activeOnly && !client)
		  query = query.is('deleted_at', null)
    
    // invoice number, client name, or order number searching
    if (search && !client)
      query = query.or(`invoice_number.ilike.%${search}%,clients.name.ilike.%${search}%`)

    if (search && client)
      query = query.or(`invoice_number.ilike.%${search}%,status_name.ilike.%${search}%`)

    //filters
    if (!client && status_code) query.eq('status.code', status_code)
    if (client) query.eq('client_id', client)
    if (order) query.eq('order_id', order)

    //sort + pagination
    const finalOrderBy = (client && orderBy === 'created_at') ? 'invoice_date' : orderBy;
    query = query
      .order(finalOrderBy, { ascending: orderDir === 'asc' })
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
    console.error('Error fetching invoices:', error)
    throw error
  }
}

export async function getInvoiceById(id) {
  try {
    if (!id) throw new Error('Invoice ID is required')

    await verifyAccessLevel(1) //support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, invoice_date, due_date, total_amount, paid_amount, status_id, invoice_statuses (name), client_id, clients (name), order_id, orders (order_number), created_at, deleted_at, invoice_items (id, quantity, unit_price, total_price, description, product_id, products (name, code))')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Invoice not found')

    return data
  } catch (error) {
    console.error('Error fetching invoice:', error)
    throw error
  }
}

export async function createInvoice(invoiceData) {
  try {
    await verifyAccessLevel(2)//manager+

    const { invoice_number, client_id, invoice_date, due_date, total_amount, status_code, order_id, invoice_items } = invoiceData

    if (!invoice_number) throw new Error('Invoice number is required')
    if (!client_id) throw new Error('Client ID is required')
    if (!total_amount || total_amount <= 0) throw new Error('Valid total amount is required')

    const supabase = await getServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user)
      throw new Error('Could not identify current user')

    //check if number unique
    const { data: existingNumber } = await supabase
      .from('invoices')
      .select('id')
      .eq('invoice_number', invoice_number)
      .maybeSingle()

    if (existingNumber)
      throw new Error('Invoice number already exists')

    //status_id from invoice_statuses
    const { data: statusRow, error: statusError } = await supabase
      .from('invoice_statuses')
      .select('id, code')
      .eq('code', status_code)
      .maybeSingle()

    if (statusError || !statusRow)
      throw new Error('Invalid invoice status')

    //14 days
    const today = new Date()
    const defaultInvoiceDate = (invoice_date || today.toISOString().split('T')[0])
    const defaultDueDate = due_date || new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

    //insert invoice
    const { data: newInvoice, error: insertError } = await supabase
      .from('invoices')
      .insert({
        invoice_number,
        client_id,
        invoice_date: defaultInvoiceDate,
        due_date: defaultDueDate, //14 days
        total_amount,
        paid_amount: 0,
        status_id: statusRow.id,
        order_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Invoice creation error: ${insertError.message}`)

    if (invoice_items && invoice_items.length > 0) {
      const itemsToInsert = invoice_items.map(item => ({
        invoice_id: newInvoice.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price || (item.quantity * item.unit_price)
      }));

      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
      if (itemsError) console.warn('Manual items insert warning:', itemsError.message);
    } 
    else if (order_id) {
      await supabase.rpc('create_invoice_items_from_order', { 
        p_invoice_id: newInvoice.id, 
        p_order_id: order_id 
      });
    }

    return await getInvoiceById(newInvoice.id)
  } catch (error) {
    console.error('Error creating invoice:', error)
    throw error
  }
}

export async function createInvoiceFromOrder(orderId){
  try{
    await verifyAccessLevel(2);//manager+
    const supabase = await getServerClient();

    const { data: invoiceExisting } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('order_id', orderId)
      .maybeSingle();

    if (invoiceExisting)
      return { invoiceAlreadyExists: true, invoiceNumber: invoiceExisting.invoice_number };

    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.rpc('create_invoice_from_order_fn', {
      p_order_id: orderId,
      p_user_id: user.id
    });

    if(error) throw new Error(error.message);

    return { success: true, data };

  } catch (error) {
    console.error('Error with creating invoice from orde4r: ', error);
    throw error;
  }
}

export async function updateInvoice(invoiceId, invoiceData) {
  try {
    if (!invoiceId) throw new Error('Invoice ID is required')

    await verifyAccessLevel(2);//manager+

    const supabase = await getServerClient()

    const { data: existing, error: selectError } = await supabase
      .from('invoices')
      .select('id, invoice_number, total_amount, status_id, invoice_statuses (code)')
      .eq('id', invoiceId)
      .is('deleted_at', null)
      .maybeSingle()

    if (selectError && selectError.code !== 'PGRST116')
      throw new Error(selectError.message);

    if (!existing) throw new Error('Invoice not found')

    //check is invoice number unique?
    const invoice_number = invoiceData.invoice_number
    if (invoice_number && invoice_number !== existing.invoice_number) {
      const { data: numberExists } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_number', invoice_number)
        .is('deleted_at', null)
        .neq('id', invoiceId)
        .maybeSingle()

      if (numberExists)
        throw new Error('Invoice number already exists')
    }

    //prevent updating paid invoices
    const currentStatusCode = existing.invoice_statuses?.code
    const lockedStatuses = ['paid', 'cancelled']

    if (lockedStatuses.includes(currentStatusCode)) {
      if (invoiceData.status_code && invoiceData.status_code !== currentStatusCode)
        throw new Error('Cannot modify locked invoice')

      if (typeof invoiceData.total_amount !== 'undefined' && invoiceData.total_amount !== existing.total_amount)
        throw new Error('Cannot modify locked invoice')
    }

    const updatePayload = { ...invoiceData }

    //status_code -> status_id
    if (invoiceData.status_code) {
      const { data: newStatus, error: statusError } = await supabase
        .from('invoice_statuses')
        .select('id, code')
        .eq('code', invoiceData.status_code)
        .maybeSingle()

      if (statusError || !newStatus)
        throw new Error('Invalid invoice status')

      updatePayload.status_id = newStatus.id
      delete updatePayload.status_code
    }

    const { error: updateError } = await supabase
      .from('invoices')
      .update(updatePayload)
      .eq('id', invoiceId)

    if (updateError)
      throw new Error(`Invoice update error: ${updateError.message}`)

    if (invoiceData.invoice_items) {
      await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId)

      if (invoiceData.invoice_items.length > 0) {
        const itemsWithInvoiceId = invoiceData.invoice_items.map(item => ({
          ...item,
          invoice_id: invoiceId
        }))
        
        await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId)
      }
    }

    return await getInvoiceById(invoiceId)
  } catch (error) {
    console.error('Error updating invoice:', error)
    throw error
  }
}

//DELETE soft delete
export async function deactivateInvoice(id) {
  try {
    if (!id) throw new Error('Invoice ID is required')

    await verifyAccessLevel(2); //manager +

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('invoices')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return await getInvoiceById(id)
  } catch (error) {
    console.error('Error deactivating invoice:', error)
    throw error
  }
}

//PATCH reactivate
export async function reactivateInvoice(id) {
  try {
    if (!id) throw new Error('Invoice ID is required')

    await verifyAccessLevel(2); //manager +

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('invoices')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return await getInvoiceById(id)
  } catch (error) {
    console.error('Error reactivating invoice:', error)
    throw error
  }
}

export async function recordPayment(invoiceId, amount, paymentMethodId) {
  try {
    await verifyAccessLevel(2); // manager+
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase.rpc('call_record_payment', {
      p_invoice_id: invoiceId,
      p_amount: amount,
      p_user_id: user.id,
      p_payment_method_id: paymentMethodId
    });

    if (error) throw new Error(error.message);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
}
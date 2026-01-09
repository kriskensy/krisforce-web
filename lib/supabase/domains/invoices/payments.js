import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

export async function getInvoicePayments(invoiceId, filters) {
  try {
    await verifyAccessLevel(1)//support+

    const { 
      search,
      activeOnly, 
      method, 
      limit = 10, 
      offset = 0, 
      orderBy = 'payment_date', 
      orderDir = 'desc' 
    } = filters

    const supabase = await getServerClient()

    let query = supabase
      .from('payments')
      .select('id, invoice_id, client_id, amount, payment_date, method_id, payment_methods (code, name), deleted_at', { count: 'exact' })

    //check if invoiceId is valid (no placeholder [id])
    const isValidUUID = invoiceId && invoiceId !== "[id]" && invoiceId !== "undefined";

    if (isValidUUID)
      query = query.eq('invoice_id', invoiceId);

    //filter active only
		if (activeOnly)
		  query = query.is('deleted_at', null)
    
    //amount or method searching
    if (search) {
      query = query.or(
        `amount.eq.${search},payment_methods.code.ilike.%${search}%,payment_methods.name.ilike.%${search}%`
      )
    }

    //filter by payment method
    if (method) {
      query = query.eq('method_id', method)
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
    console.error('Error fetching invoice payments:', error)
    throw error
  }
}

export async function getInvoicePaymentById(paymentId, invoice_id) {
  try {
    if (!paymentId || !invoice_id) throw new Error('Payment ID and Invoice ID are required')
    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('payments')
      .select('id, invoice_id, client_id, amount, payment_date, method_id, payment_methods (code, name), deleted_at')
      .eq('id', paymentId)
      .eq('invoice_id', invoice_id)
      .is('deleted_at', null)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Invoice payment not found')

    return data
  } catch (error) {
    console.error('Error fetching invoice payment:', error)
    throw error
  }
}

export async function createInvoicePayment(invoice_id, paymentData) {
  try {
    if (!invoice_id) throw new Error('Invoice ID is required')
    await verifyAccessLevel(2)//manager+

    const { amount, payment_date, method_id } = paymentData
    
    if (!amount || amount <= 0) throw new Error('Valid payment amount is required')
    if (!payment_date) throw new Error('Payment date is required')
    if (!method_id) throw new Error('Payment method ID is required')

    const supabase = await getServerClient()

    //check if invoice exists and get client ID
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, client_id, total_amount, paid_amount, status:invoice_statuses!status_id (code)')
      .eq('id', invoice_id)
      .is('deleted_at', null)
      .single()
    
    if (invoiceError || !invoice) throw new Error('Invoice not found')
    
    //check if payment exceeds remaining amount
    const remaining = invoice.total_amount - invoice.paid_amount
    if (amount > remaining)
      throw new Error(`Payment exceeds remaining amount (${remaining.toFixed(2)})`);

    const { data: newPayment, error: insertError } = await supabase
      .from('payments')
      .insert({
        invoice_id,
        client_id: invoice.client_id,
        amount,
        payment_date,
        method_id
      })
      .select()
      .single()

    if (insertError) throw new Error(`Payment creation error: ${insertError.message}`)

    return await getInvoicePaymentById(newPayment.id, invoice_id)
  } catch (error) {
    console.error('Error creating invoice payment:', error)
    throw error
  }
}

export async function updateInvoicePayment(paymentId, invoice_id, paymentData) {
  try {
    if (!paymentId || !invoice_id) throw new Error('Payment ID and Invoice ID are required')
    await verifyAccessLevel(2)//manager+

    const { amount, payment_date, method_id } = paymentData

    const supabase = await getServerClient()

    //check if payment exists and belongs to invoice
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, amount, invoice:invoices(id, total_amount, paid_amount)')
      .eq('id', paymentId)
      .eq('invoice_id', invoice_id)
      .single()

    if (!existingPayment) throw new Error('Invoice payment not found')

    if (amount !== undefined && amount !== existingPayment.amount) {
      if (amount <= 0) throw new Error('Amount must be greater than zero')
      
      const otherPaymentsSum = existingPayment.invoice.paid_amount - existingPayment.amount
      const availableLimit = existingPayment.invoice.total_amount - otherPaymentsSum

      if (amount > availableLimit) {
        throw new Error(`Updated amount exceeds available limit (${availableLimit.toFixed(2)})`)
      }
    }

    const updatePayload = {}
    if (amount !== undefined) updatePayload.amount = amount
    if (payment_date !== undefined) updatePayload.payment_date = payment_date
    if (method_id !== undefined) updatePayload.method_id = method_id

    const { error: updateError } = await supabase
      .from('payments')
      .update(updatePayload)
      .eq('id', paymentId)
      .eq('invoice_id', invoice_id)

    if (updateError)
      throw new Error(`Payment update error: ${updateError.message}`)

    return await getInvoicePaymentById(paymentId, invoice_id)
  } catch (error) {
    console.error('Error updating invoice payment:', error)
    throw error
  }
}

//DELETE soft delete
export async function deactivateInvoicePayment(paymentId, invoice_id) {
  try {
    if (!paymentId || !invoice_id) throw new Error('Payment ID and Invoice ID are required')
    await verifyAccessLevel(2)//manager+

    const supabase = await getServerClient()

    const { error: deleteError } = await supabase
      .from('payments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', paymentId)
      .eq('invoice_id', invoice_id)

    if (deleteError)
      throw new Error(`Payment deletion error: ${deleteError.message}`)

    return { success: true, message: 'Invoice payment deleted successfully' }
  } catch (error) {
    console.error('Error deleting invoice payment:', error)
    throw error
  }
}

//PATCH reactivate
export async function reactivateInvoicePayment(paymentId, invoice_id) {
  try {
    if (!paymentId || !invoice_id) throw new Error('Payment ID and Invoice ID are required')
    await verifyAccessLevel(2)//manager+

    const supabase = await getServerClient()

    const { error: reactivateError } = await supabase
      .from('payments')
      .update({ deleted_at: null })
      .eq('id', paymentId)
      .eq('invoice_id', invoice_id)

    if (reactivateError)
      throw new Error(`Payment reactivation error: ${reactivateError.message}`)

    return { success: true, message: 'Invoice payment reactivated successfully' }
  } catch (error) {
    console.error('Error reactivating invoice payment:', error)
    throw error
  }
}
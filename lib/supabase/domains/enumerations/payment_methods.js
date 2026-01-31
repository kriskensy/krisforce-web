import { getServerClient } from '../../server'
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel'

export async function getPaymentMethods(filters = {}) {
  try {
    const {
      search,
      activeOnly,
      active,
      limit = 10,
      offset = 0,
      orderBy = 'code',
      orderDir = 'asc'
    } = filters

    await verifyAccessLevel(1)//support+

    const supabase = await getServerClient()
    let query = supabase
      .from('payment_methods')
      .select('id, code, name, active', { count: 'exact' })

    //filter active only
		if (activeOnly)
		  query = query.is('active', true)
    
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
    console.error('Error fetching payment methods:', error)
    throw error
  }
}

export async function getPaymentMethodById(id) {
  try {
    if (!id) throw new Error('Payment method ID/code is required')

    await verifyAccessLevel(1)//suppport+

    const supabase = await getServerClient()
    
    let { data, error } = await supabase
      .from('payment_methods')
      .select('id, code, name, active')
      .eq('id', id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if (!data) throw new Error('Payment method not found')

    return data
  } catch (error) {
    console.error('Error fetching payment method:', error)
    throw error
  }
}

export async function createPaymentMethod(paymentMethodData) {
  try {
    await verifyAccessLevel(3)//admin

    const { code, name } = paymentMethodData

    if (!code || code.trim() === '') throw new Error('Payment method code is required')
    if (!name || name.trim() === '') throw new Error('Payment method name is required')

    const supabase = await getServerClient()

    //check is code unique?
    const { data: existingPaymentMethodsCode } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('code', code.trim().toLowerCase())
      .maybeSingle()

    if (existingPaymentMethodsCode)
      throw new Error('Payment method code already exists')

    const { data: newMethod, error: insertError } = await supabase
      .from('payment_methods')
      .insert({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        active: true
      })
      .select()
      .single()

    if (insertError)
      throw new Error(`Payment method creation error: ${insertError.message}`)

    return await getPaymentMethodById(newMethod.id)
  } catch (error) {
    console.error('Error creating payment method:', error)
    throw error
  }
}

export async function updatePaymentMethod(id, paymentMethodData) {
  try {
    if (!id) throw new Error('Payment method ID is required')

    await verifyAccessLevel(3)//admin

    const { code, name, active } = paymentMethodData
    const supabase = await getServerClient()

    const { data: existingPaymentMethods } = await supabase
      .from('payment_methods')
      .select('id, code')
      .eq('id', id)
      .single()

    if (!existingPaymentMethods) throw new Error('Payment method not found')

    if (code && code.trim().toLowerCase() !== existingPaymentMethods.code) {
      const { data: codeExists } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('code', code.trim().toLowerCase())
        .neq('id', id)
        .maybeSingle()

      if (codeExists)
        throw new Error('Payment method code already exists')
    }

    const updatePayload = {}
    if (code !== undefined) updatePayload.code = code.trim().toLowerCase()
    if (name !== undefined) updatePayload.name = name.trim()
    if (active !== undefined) updatePayload.active = active

    const { error: updateError } = await supabase
      .from('payment_methods')
      .update(updatePayload)
      .eq('id', id)

    if (updateError)
      throw new Error(`Payment method update error: ${updateError.message}`)

    return await getPaymentMethodById(id)
  } catch (error) {
    console.error('Error updating payment method:', error)
    throw error
  }
}

export async function deletePaymentMethod(id) {
  try {
    if (!id) throw new Error('Payment method ID is required')

    await verifyAccessLevel(3)//admin

    const supabase = await getServerClient()

    //check if payment method is in use
    const { count: paymentMethodUsageCount, error: paymentsError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('method_id', id)
      .is('deleted_at', null)

    if (paymentsError)
      throw new Error(`Usage check error: ${paymentsError.message}`)

    if (paymentMethodUsageCount > 0)
      throw new Error(`Cannot delete payment method used in ${paymentMethodUsageCount} payments`)

    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Payment method deletion error: ${error.message}`)

    return { success: true, message: 'Payment method deleted successfully' }
  } catch (error) {
    console.error('Error deleting payment method:', error)
    throw error
  }
}

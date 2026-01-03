import { getPaymentMethodById, updatePaymentMethod, deletePaymentMethod } from '@/lib/supabase/domains/enumerations/payment_methods'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const paymentMethod = await getPaymentMethodById(id)

    if(!paymentMethod) {
      return Response.json(
        { error: 'Address type not found' },
        { status: 404 }
      )
    }

    return Response.json(paymentMethod, { status: 200 })
  } catch (error) {
    console.error('GET /api/enumerations/payment_methods/[id] error:', error)

    return Response.json(
      { error: 'Failed to fetch payment method', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    const paymentMethod = await updatePaymentMethod(id, data)

    return Response.json(paymentMethod, { status: 200 })
  } catch (error) {
    console.error('PUT /api/enumerations/payment_methods/[id] error:', error)
    return Response.json(
      { error: 'Failed to update payment method', message: error.message },
      { status: 400 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const result = await deletePaymentMethod(id)
    
    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/enumerations/payment_methods/[id] error:', error)
    return Response.json(
      { error: 'Failed to delete payment method', message: error.message },
      { status: 400 }
    )
  }
}

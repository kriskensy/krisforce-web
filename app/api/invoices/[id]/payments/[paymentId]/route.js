import { getInvoicePaymentById, updateInvoicePayment, deactivateInvoicePayment, reactivateInvoicePayment } from '../../../../../../lib/supabase/domains/invoices/payments'

export async function GET(request, { params }) {
  try {
    const { id, paymentId } = await params
    const payment = await getInvoicePaymentById(paymentId, id)

    return Response.json(payment, { status: 200 })
  } catch (error) {
    console.error('GET /api/invoices/[id]/payments/[paymentId] error:', error)
    return Response.json(
      { error: 'Failed to fetch invoice payment', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id, paymentId } = await params
    const data = await request.json()
    
    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    const payment = await updateInvoicePayment(paymentId, id, data)
    return Response.json(payment, { status: 200 })
  } catch (error) {
    console.error('PUT /api/invoices/[id]/payments/[paymentId] error:', error)
    return Response.json(
      { error: 'Failed to update invoice payment', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, paymentId } = await params
    const result = await deactivateInvoicePayment(paymentId, id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/invoices/[id]/payments/[paymentId] error:', error)
    return Response.json(
      { error: 'Failed to delete invoice payment', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id, paymentId } = await params
    const result = await reactivateInvoicePayment(paymentId, id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/invoices/[id]/payments/[paymentId] error:', error)
    return Response.json(
      { error: 'Failed to reactivate invoice payment', message: error.message },
      { status: 500 }
    )
  }
}
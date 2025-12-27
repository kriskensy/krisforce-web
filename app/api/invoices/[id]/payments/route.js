import { getInvoicePayments, createInvoicePayment } from '../../../../../lib/supabase/domains/invoices/payments'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      method: searchParams.get('method'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'payment_date',
      orderDir: searchParams.get('order') || 'desc'
    }

    const result = await getInvoicePayments(id, filters)
    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total.toString()
      }
    })
  } catch (error) {
    console.error('GET /api/invoices/[id]/payments error:', error)
    return Response.json(
      { error: 'Failed to fetch invoice payments', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    
    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    if (!data.amount || !data.payment_date || !data.method_id) {
      return Response.json(
        { error: 'Validation error', message: 'Amount, payment date and method required' },
        { status: 400 }
      )
    }

    const payment = await createInvoicePayment(id, data)
    return Response.json(payment, { status: 201 })
  } catch (error) {
    console.error('POST /api/invoices/[id]/payments error:', error)
    return Response.json(
      { error: 'Failed to create invoice payment', message: error.message },
      { status: 500 }
    )
  }
}
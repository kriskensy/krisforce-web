import { getInvoiceById, updateInvoice, deactivateInvoice, reactivateInvoice 
} from '../../../../lib/supabase/domains/invoices/invoices'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const invoice = await getInvoiceById(id)

    if (!invoice) {
      return Response.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }
    
    return Response.json(invoice, { status: 200 })
  } catch (error) {
    console.error('GET /api/invoices/[id] error:', error)
    return Response.json(
      { error: 'Failed to fetch invoice', message: error.message },
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

    const invoice = await updateInvoice(id, data)

    return Response.json(invoice, { status: 200 })
  } catch (error) {
    console.error('PUT /api/invoices/[id] error:', error)
    return Response.json(
      { error: 'Failed to update invoice', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const invoice = await deactivateInvoice(id)

    return Response.json(invoice, { status: 200 })

  } catch (error) {
    console.error('DELETE /api/invoices/[id] error:', error)
    return Response.json(
      { error: 'Failed to deactivate invoice', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const invoice = await reactivateInvoice(id)

    return Response.json(invoice, { status: 200 })

  } catch (error) {
    console.error('PATCH /api/invoices/[id] error:', error)
    return Response.json(
      { error: 'Failed to reactivate invoice', message: error.message },
      { status: 500 }
    )
  }
}
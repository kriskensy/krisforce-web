import { getInvoiceItemById, updateInvoiceItem, deleteInvoiceItem } from '@/lib/supabase/domains/invoices/invoice_items'

export async function GET(request, { params }) {
  try {
    const { id, itemId } = await params
    const item = await getInvoiceItemById(itemId, id)

    return Response.json(item, { status: 200 })
  } catch (error) {
    console.error('GET /api/invoices/[id]/items/[itemId] error:', error)
    return Response.json(
      { error: 'Failed to fetch invoice item', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id, itemId } = await params
    const data = await request.json()
    
    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    const item = await updateInvoiceItem(itemId, id, data)
    return Response.json(item, { status: 200 })
  } catch (error) {
    console.error('PUT /api/invoices/[id]/items/[itemId] error:', error)
    return Response.json(
      { error: 'Failed to update invoice item', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, itemId } = await params
    const result = await deleteInvoiceItem(itemId, id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/invoices/[id]/items/[itemId] error:', error)
    return Response.json(
      { error: 'Failed to delete invoice item', message: error.message },
      { status: 500 }
    )
  }
}
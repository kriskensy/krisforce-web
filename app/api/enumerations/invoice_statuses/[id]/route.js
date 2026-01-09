import { getInvoiceStatusById, updateInvoiceStatus, deleteInvoiceStatus } from '@/lib/supabase/domains/enumerations/invoice_statuses'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const invoiceStatus = await getInvoiceStatusById(id)
    
    if(!invoiceStatus) {
      return Response.json(
        { error: 'Invoice type not found' },
        { status: 404 }
      )
    }

    return Response.json(invoiceStatus)
  } catch (error) {
    console.error(`GET /api/enumerations/invoice_statuses/[id] error:`, error)
    return Response.json(
      { error: 'Invoice status not found', message: error.message },
      { status: 404 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    const updatedStatus = await updateInvoiceStatus(id, data)
    
    return Response.json(updatedStatus)
  } catch (error) {
    console.error(`PATCH /api/enumerations/invoice_statuses/[id] error:`, error)
    return Response.json(
      { error: 'Failed to update invoice status', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const result = await deleteInvoiceStatus(id)
    
    return Response.json(result)
  } catch (error) {
    console.error(`DELETE /api/enumerations/invoice_statuses/[id] error:`, error)
    return Response.json(
      { error: 'Failed to delete invoice status', message: error.message },
      { status: 500 }
    )
  }
}
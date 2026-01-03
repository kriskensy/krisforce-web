import { getInvoiceItems, createInvoiceItem } from '@/lib/supabase/domains/invoices/invoice_items'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'invoice_id',
      orderDir: searchParams.get('order') || 'asc'
    }

    const result = await getInvoiceItems(id, filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total.toString()
      }
    })
  } catch (error) {
    console.error('GET /api/invoices/[id]/items error:', error)
    return Response.json(
      { error: 'Failed to fetch invoice items', message: error.message },
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

    if (!data.description || !data.quantity || !data.unit_price) {
      return Response.json(
        { error: 'Validation error', message: 'Description, quantity and unit price required' },
        { status: 400 }
      )
    }

    const item = await createInvoiceItem(id, data)
    return Response.json(item, { status: 201 })
  } catch (error) {
    console.error('POST /api/invoices/[id]/items error:', error)
    return Response.json(
      { error: 'Failed to create invoice item', message: error.message },
      { status: 500 }
    )
  }
}
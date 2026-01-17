import { getInvoices, createInvoice } from '@/lib/supabase/domains/invoices/invoices'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      activeOnly: searchParams.get('activeOnly') === 'true',
      status_code: searchParams.get('status'),
      client: searchParams.get('client_id'),
      order: searchParams.get('order'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'created_at',
      orderDir: searchParams.get('orderDir') || 'desc'
    }

    const result = await getInvoices(filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/invoices error:', error)
    return Response.json(
      { error: 'Failed to fetch invoices', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    if (!data.invoice_number || !data.client_id || !data.total_amount) {
      return Response.json(
        { error: 'Validation error', message: 'Invoice number, client and total amount required' },
        { status: 400 }
      )
    }

    const invoice = await createInvoice(data)

    return Response.json(invoice, { status: 201 })
  } catch (error) {
    console.error('POST /api/invoices error:', error)
    return Response.json(
      { error: 'Failed to create invoice', message: error.message },
      { status: 500 }
    )
  }
}

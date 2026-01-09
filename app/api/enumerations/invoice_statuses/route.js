import { getInvoiceStatuses, createInvoiceStatus } from '@/lib/supabase/domains/enumerations/invoice_statuses'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      activeOnly: searchParams.get('activeOnly') === 'true',
      limit: parseInt(searchParams.get('limit') || 10),
      offset: parseInt(searchParams.get('offset') || 0),
      orderBy: searchParams.get('orderBy') || 'code',
      orderDir: searchParams.get('order') || 'asc'
    }

    const result = await getInvoiceStatuses(filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total.toString()
      }
    })
  } catch (error) {
    console.error('GET /api/enumerations/invoice_statuses error:', error)
    return Response.json(
      { error: 'Failed to fetch invoice statuses', message: error.message },
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

    const newStatus = await createInvoiceStatus(data)
    
    return Response.json(newStatus, { status: 201 })
  } catch (error) {
    console.error('POST /api/enumerations/invoice_statuses error:', error)
    return Response.json(
      { error: 'Failed to create invoice status', message: error.message },
      { status: 500 }
    )
  }
}
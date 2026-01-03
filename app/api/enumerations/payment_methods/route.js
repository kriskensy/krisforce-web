import { getPaymentMethods, createPaymentMethod } from '@/lib/supabase/domains/enumerations/payment_methods'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      active: searchParams.get('active'),
      limit: parseInt(searchParams.get('limit') || 10),
      offset: parseInt(searchParams.get('offset') || 0),
      orderBy: searchParams.get('orderBy') || 'code',
      orderDir: searchParams.get('order') || 'asc'
    }

    const result = await getPaymentMethods(filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/enumerations/payment_methods error:', error)
    return Response.json(
      { error: 'Failed to fetch payment methods', message: error.message },
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

    if (!data.code || !data.name) {
      return Response.json(
        { error: 'Validation error', message: 'Code and name required' },
        { status: 400 }
      )
    }

    const paymentMethod = await createPaymentMethod(data)

    return Response.json(paymentMethod, { status: 201 })
  } catch (error) {
    console.error('POST /api/enumerations/payment_methods error:', error)
    return Response.json(
      { error: 'Failed to create payment method', message: error.message },
      { status: 400 }
    )
  }
}

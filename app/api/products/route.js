import { getProducts, createProduct } from '@/lib/supabase/domains/products/products'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      activeOnly: searchParams.get('activeOnly') === 'true',
      category: searchParams.get('category'),
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0'),
      orderBy: searchParams.get('orderBy') || 'name',
      orderDir: searchParams.get('order') || 'desc'
    }

    const result = await getProducts(filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/products error:', error)

    return Response.json(
      { error: 'Failed to fetch products', message: error.message },
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

    if (!data.code || !data.name || !data.standard_price) {
      return Response.json({ error: 'Validation error', message: 'Product code, name and price required' }, { status: 400 })
    }

    const product = await createProduct(data)

    return Response.json(product, { status: 201 })
  } catch (error) {
    console.error('POST /api/products error:', error)
    return Response.json(
      { error: 'Failed to create product', message: error.message },
      { status: 500 }
    )
  }
}

import { getPriceListItems, createPriceListItem } from '@/lib/supabase/domains/price_lists/price_list_items'

export async function GET(request, { params }) {
  try {
    const { pricelistid } = await params
    const { searchParams } = new URL(request.url)
    
    const filters = {
      price_list_id: searchParams.get('price_list_id'),
      activeOnly: searchParams.get('activeOnly') === 'true',
      product_id: searchParams.get('product_id'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'products (name)',
      orderDir: searchParams.get('order') || 'desc'
    }

    const result = await getPriceListItems(filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/price_lists/[id]/items error:', error)
    return Response.json(
      { error: 'Failed to fetch price list items', message: error.message },
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
    if (!data.product_id || data.price === undefined) {
      return Response.json(
        { error: 'Validation error', message: 'Product ID and price required' },
        { status: 400 }
      )
    }

    const itemData = {
      price_list_id: id,
      ...data
    }

    const item = await createPriceListItem(itemData)
    return Response.json(item, { status: 201 })
  } catch (error) {
    console.error('POST /api/price_lists/[id]/items error:', error)
    return Response.json(
      { error: 'Failed to create price list item', message: error.message },
      { status: 400 }
    )
  }
}

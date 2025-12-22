import { getPriceLists, createPriceList } from '../../../lib/supabase/domains/price_lists/price_lists'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'valid_to',
      orderDir: searchParams.get('order') || 'asc'
    }

    const result = await getPriceLists(filters)

    return Response.json(result, {
      status: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/price_lists error:', error)
    return Response.json(
      { error: 'Failed to fetch price lists', message: error.message },
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
    if (!data.name) {
      return Response.json(
        { error: 'Validation error', message: 'Price list name required' },
        { status: 400 }
      )
    }
    const priceList = await createPriceList(data)

    return Response.json(priceList, { status: 201 })
  } catch (error) {
    console.error('POST /api/price_lists error:', error)
    return Response.json(
      { error: 'Failed to create price list', message: error.message },
      { status: 500 }
    )
  }
}

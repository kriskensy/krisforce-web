import { getPriceListById, updatePriceList, deactivatePriceList, reactivatePriceList } from '@/lib/supabase/domains/price_lists/price_lists'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const priceList = await getPriceListById(id)

    if (!priceList) {
      return Response.json(
        { error: 'Price list not found' },
        { status: 404 }
      )
    }
    return Response.json(priceList, { status: 200 })
  } catch (error) {
    console.error('GET /api/price_lists/[id] error:', error)
    return Response.json(
      { error: 'Failed to fetch price list', message: error.message },
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
    const priceList = await updatePriceList(id, data)

    return Response.json(priceList, { status: 200 })
  } catch (error) {
    console.error('PUT /api/price_lists/[id] error:', error)
    return Response.json(
      { error: 'Failed to update price list', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const priceList = await deactivatePriceList(id)

    return Response.json(priceList, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/price_lists/[id] error:', error)
    return Response.json(
      { error: 'Failed to deactivate price list', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const priceList = await reactivatePriceList(id)

    return Response.json(priceList, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/price_lists/[id] error:', error)
    return Response.json(
      { error: 'Failed to reactivate price list', message: error.message },
      { status: 500 }
    )
  }
}
import { getPriceListItemById, updatePriceListItem, deactivatePriceListItem, reactivatePriceListItem } from '../../../../../../lib/supabase/domains/price_lists/price_list_items'

export async function GET(request, { params }) {
  try {
    const { itemId } = await params
    const item = await getPriceListItemById(itemId)

    if (!item) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return Response.json(item, { status: 200 })
  } catch (error) {
    console.error('GET /api/price_lists/[id]/items/[itemId] error:', error)

    return Response.json(
      { error: 'Failed to fetch price list item', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { itemId } = await params
    const data = await request.json()

    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    const item = await updatePriceListItem(itemId, data)
    
    return Response.json(item, { status: 200 })
  } catch (error) {
    console.error('PUT /api/price_lists/[id]/items/[itemId] error:', error)
    return Response.json(
      { error: 'Failed to update price list item', message: error.message },
      { status: 400 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { itemId } = await params
    const result = await deactivatePriceListItem(itemId)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/price_lists/[id]/items/[itemId] error:', error)
    return Response.json(
      { error: 'Failed to delete price list item', message: error.message },
      { status: 400 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { itemId } = await params
    const item = await reactivatePriceListItem(itemId)

    return Response.json(item, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/price_lists/[id]/items/[itemId] error:', error)
    return Response.json(
      { error: 'Failed to reactivate price list item', message: error.message },
      { status: 400 }
    )
  }
}

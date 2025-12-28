import { getProductById, updateProduct, deactivateProduct, reactivateProduct } from '../../../../lib/supabase/domains/products/products'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const product = await getProductById(id)

    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return Response.json(product, { status: 200 })
  } catch (error) {
    console.error('GET /api/products/[id] error:', error)
    return Response.json(
      { error: 'Failed to fetch product', message: error.message },
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
    const product = await updateProduct(id, data)

    return Response.json(product, { status: 200 })
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error)
    return Response.json(
      { error: 'Failed to update product', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const product = await deactivateProduct(id)

    return Response.json(product, { status: 200 })

  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error)
    return Response.json(
      { error: 'Failed to deactivate product', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const product = await reactivateProduct(id)

    return Response.json(product, { status: 200 })

  } catch (error) {
    console.error('PATCH /api/products/[id] error:', error)
    return Response.json(
      { error: 'Failed to reactivate product', message: error.message },
      { status: 500 }
    )
  }
}
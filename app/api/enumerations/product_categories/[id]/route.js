import { getProductCategoryById, updateProductCategory, deleteProductCategory } from '@/lib/supabase/domains/enumerations/product_categories'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const productCategory = await getProductCategoryById(id)

    if(!productCategory) {
      return Response.json(
        { error: 'Product category not found' },
        { status: 404 }
      )
    }

    return Response.json(productCategory, { status: 200 })
  } catch (error) {
    console.error('GET /api/enumerations/product_categories/[id] error:', error)

    return Response.json(
      { error: 'Failed to fetch product category', message: error.message },
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

    const productCategory = await updateProductCategory(id, data)
    
    return Response.json(productCategory, { status: 200 })
  } catch (error) {
    console.error('PUT /api/enumerations/product_categories/[id] error:', error)
    return Response.json(
      { error: 'Failed to update product category', message: error.message },
      { status: 400 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const result = await deleteProductCategory(id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/enumerations/product_categories/[id] error:', error)
    return Response.json(
      { error: 'Failed to delete product category', message: error.message },
      { status: 400 }
    )
  }
}

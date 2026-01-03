import { getOrderWorkflow, updateOrderStatus } from '@/lib/supabase/domains/orders/order_workflow'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    
    const filters = {
      search: searchParams.get('search'),
      status: searchParams.get('status'),
      limit: parseInt(searchParams.get('limit')) || 20,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'changed_at',
      orderDir: searchParams.get('order') || 'desc'
    }

    const result = await getOrderWorkflow(id, filters)
    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/orders/[id]/workflow error:', error)
    return Response.json(
      { error: 'Failed to fetch order workflow', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    
    if (!data || !data.status_code) {
      return Response.json(
        { error: 'Validation error', message: 'status_code is required' },
        { status: 400 }
      )
    }

    //SQL procedure make update in orders and insert in workflow
    const result = await updateOrderStatus(id, data.status_code)

    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders/[id]/workflow error:', error)
    return Response.json(
      { error: 'Failed to create order workflow', message: error.message },
      { status: 500 }
    )
  }
}

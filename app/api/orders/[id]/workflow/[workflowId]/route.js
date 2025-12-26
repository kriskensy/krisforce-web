import { getOrderWorkflowById, deleteOrderWorkflow } from '../../../../../../lib/supabase/domains/orders/order_workflow'

export async function GET(request, { params }) {
  try {
    const { id, workflowId } = await params
    const workflow = await getOrderWorkflowById(workflowId, id)

    return Response.json(workflow, { status: 200 })
  } catch (error) {
    console.error('GET /api/orders/[id]/workflow/[workflowId] error:', error)
    return Response.json(
      { error: 'Failed to fetch order workflow record', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, workflowId } = await params
    const result = await deleteOrderWorkflow(workflowId, id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/orders/[id]/workflow/[workflowId] error:', error)
    return Response.json(
      { error: 'Failed to delete order workflow record', message: error.message },
      { status: 500 }
    )
  }
}
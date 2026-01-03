import { getClientContractById, updateClientContract, deactivateClientContract,  reactivateClientContract } from '@/lib/supabase/domains/clients/contracts'

export async function GET(request, { params }) {
  try {
    const { id, contractId } = await params
    const contract = await getClientContractById(contractId, id)

    return Response.json(contract, { status: 200 })
  } catch (error) {
    console.error('GET /api/clients/[id]/contracts/[contractId] error:', error)
    return Response.json(
      { error: 'Failed to fetch client contract', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id, contractId } = await params
    const data = await request.json()
    
    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    const contract = await updateClientContract(contractId, id, data)
    return Response.json(contract, { status: 200 })
  } catch (error) {
    console.error('PUT /api/clients/[id]/contracts/[contractId] error:', error)
    return Response.json(
      { error: 'Failed to update client contract', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, contractId } = await params
    const contract = await deactivateClientContract(contractId, id)

    return Response.json(contract, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/clients/[id]/contracts/[contractId] error:', error)
    return Response.json(
      { error: 'Failed to deactivate client contract', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id, contractId } = await params
    const contract = await reactivateClientContract(contractId, id)

    return Response.json(contract, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/clients/[id]/contracts/[contractId] error:', error)
    return Response.json(
      { error: 'Failed to reactivate client contract', message: error.message },
      { status: 500 }
    )
  }
}
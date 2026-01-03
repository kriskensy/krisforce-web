import { getRoleById, updateRole, deleteRole, deactivateRole, reactivateRole } from '@/lib/supabase/domains/roles/roles'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const role = await getRoleById(id)

    if (!role) {
      return Response.json(
        { error: 'Role not found' },
        { status: 404 })
    }

    return Response.json(role, { status: 200 })
  } catch (error) {
    console.error('GET /api/roles/[id] error:', error)
    return Response.json(
      { error: 'Failed to fetch role', message: error.message },
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

    const role = await updateRole(id, data)

    return Response.json(role, { status: 200 })
  } catch (error) {
    console.error('PUT /api/roles/[id] error:', error)
    return Response.json(
      { error: 'Failed to update role', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const result = await deleteRole(id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/roles/[id] error:', error)
    return Response.json(
      { error: 'Failed to delete role', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    
    if (data.action === 'deactivate') {
      const role = await deactivateRole(id)
      return Response.json(role, { status: 200 })
    }
    if (data.action === 'reactivate') {
      const role = await reactivateRole(id)
      return Response.json(role, { status: 200 })
    }
    if (data.action !== 'deactivate' || data.action !== 'reactivate') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid action (deactivate or reactivate)' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('PATCH /api/roles/[id] error:', error)
    return Response.json(
      { error: 'Failed to update role status', message: error.message },
      { status: 500 }
    )
  }
}

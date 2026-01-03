import { getContactTypeById, updateContactType, deleteContactType } from '@/lib/supabase/domains/enumerations/contact_types'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const contactType = await getContactTypeById(id)

    if(!contactType) {
      return Response.json(
        { error: 'Contact type not found' },
        { status: 404 }
      )
    }

    return Response.json(contactType, { status: 200 })
  } catch (error) {
    console.error('GET /api/enumerations/contact_types/[id] error:', error)

    return Response.json(
      { error: 'Failed to fetch contact type', message: error.message },
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

    const contactType = await updateContactType(id, data)
    
    return Response.json(contactType, { status: 200 })
  } catch (error) {
    console.error('PUT /api/enumerations/contact_types/[id] error:', error)
    return Response.json(
      { error: 'Failed to update contact type', message: error.message },
      { status: 400 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const result = await deleteContactType(id)

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/enumerations/contact_types/[id] error:', error)
    return Response.json(
      { error: 'Failed to delete contact type', message: error.message },
      { status: 400 }
    )
  }
}

import { getClientContactById, updateClientContact, deleteClientContact } from '@/lib/supabase/domains/clients/client_contacts'

export async function GET(request, { params }) {
  try {
    const { id, contactId } = await params
    const contact = await getClientContactById(contactId, id)

    return Response.json(contact, { status: 200 })
  } catch (error) {
    console.error('GET /api/clients/[id]/contacts/[contactId] error:', error)
    return Response.json(
      { error: 'Failed to fetch client contact', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id, contactId } = await params
    const data = await request.json()
    
    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      )
    }

    if (!data.contact_type_id || !data.value) {
      return Response.json(
        { error: 'Validation error', message: 'Contact type and value required' },
        { status: 400 }
      )
    }

    const contact = await updateClientContact(contactId, id, data)
    return Response.json(contact, { status: 200 })
  } catch (error) {
    console.error('PUT /api/clients/[id]/contacts/[contactId] error:', error)
    return Response.json(
      { error: 'Failed to update client contact', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { contactId } = await params
    const result = await deleteClientContact(contactId)

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: 'Failed to delete', message: error.message },
      { status: 500 }
    );
  }
}
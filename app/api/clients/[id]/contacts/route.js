import { getClientContacts, createClientContact } from '@/lib/supabase/domains/clients/client_contacts'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      activeOnly: searchParams.get('activeOnly') === 'true',
      contact_type_id: searchParams.get('contact_type_id'),
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
      orderBy: searchParams.get('orderBy') || 'client_id',
      orderDir: searchParams.get('order') || 'desc'
    }

    const result = await getClientContacts(id, filters)
    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total.toString()
      }
    })
  } catch (error) {
    console.error('GET /api/clients/[id]/contacts error:', error)
    return Response.json(
      { error: 'Failed to fetch client contacts', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params
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

    const contact = await createClientContact(id, data)
    return Response.json(contact, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients/[id]/contacts error:', error)
    return Response.json(
      { error: 'Failed to create client contact', message: error.message },
      { status: 500 }
    )
  }
}
import { getClientById } from "@/lib/supabase/domains/clients";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await getClientById(id);

    if(!client) {
      return Response.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return Response.json(client, { status: 200 })

  } catch (error) {
    console.error('GET /api/clients/[id] error:', error)

    return Response.json(
      { error: 'Failed to fetch client', message: error.message },
      { status: 500 }
    )
  } 
}
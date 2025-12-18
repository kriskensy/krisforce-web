import { deactivateClient, getClientById, reactivateClient } from "@/lib/supabase/domains/clients/clients";

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

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const client = await deactivateClient(id);

    return Response.json(client, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error);

    return Response.json(
      { error: 'Failed to deactivate client', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const client = await reactivateClient(id);

    return Response.json(client, { status: 200 });

  } catch (error) {
    console.error('PATCH /api/clients/[id] error:', error);

    return Response.json(
      { error: 'Failed to reactivate client', message: error.message },
      { status: 500 }
    )
  }
}
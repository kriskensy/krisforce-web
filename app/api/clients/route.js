import { getClients, createClient } from "@/lib/supabase/domains/clients/clients";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') ||'0'),
      orderBy: searchParams.get('orderBy') || 'created_at',
      order: searchParams.get('order') || 'desc',
    }

    const result = await getClients(filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })

  } catch (error) {
    console.error('GET /api/clients error:', error)

    return Response.json(
      { error: 'Failed to fetch clients', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      );
    }

    if (!data.name || !data.nip) {
      return Response.json(
        { error: 'Validation error', message: 'Client name and NIP are required' },
        { status: 400 }
      );
    }

    const client = await createClient(data);

    return Response.json(client, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients error', error);

    return Response.json(
      { error: 'Failed to create client', message: error.message },
      { status: 500 }
    );
  }
}
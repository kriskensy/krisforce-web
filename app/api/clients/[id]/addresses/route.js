import { getClientAddresses, createClientAddress } from '@/lib/supabase/domains/clients/client_addresses';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const searchParams = new URL(request.url).searchParams;

    const filters = {
      search: searchParams.get('search'),
      activeOnly: searchParams.get('activeOnly') === 'true',
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
    };

    const result = await getClientAddresses(id, filters);

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      },
    });

  } catch (error) {
    console.error('GET /api/clients/[id]/addresses error', error);

    return Response.json(
      { error: 'Failed to fetch addresses', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      );
    }

    if (!data.address_type_id || !data.street || !data.city) {
      return Response.json(
        { error: 'Validation error', message: 'address_type_id, street, and city are required' },
        { status: 400 }
      );
    }

    const address = await createClientAddress(id, data);

    return Response.json(address, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients/[id]/addresses error', error);

    return Response.json(
      { error: 'Failed to create address', message: error.message },
      { status: 500 }
    );
  }
}
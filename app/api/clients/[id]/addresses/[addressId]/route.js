import { getClientAddressById, updateClientAddress, deleteClientAddress } from '@/lib/supabase/domains/clients/client_addresses';

export async function GET(request, { params }) {
  try {
    const { id, addressId } = await params;

    const address = await getClientAddressById(id, addressId);

    return Response.json(address, { status: 200 });
  } catch (error) {
    console.error('GET /api/clients/[id]/addresses/[addressId] error', error);

    return Response.json(
      { error: 'Failed to fetch address', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id, addressId } = await params;
    const data = await request.json();

    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      );
    }

    const address = await updateClientAddress(id, addressId, data);

    return Response.json(address, { status: 200 });
  } catch (error) {
    console.error('PUT /api/clients/[id]/addresses/[addressId] error', error);

    return Response.json(
      { error: 'Failed to update address', message: error.message },
      { status }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, addressId } = await params;

    await deleteClientAddress(id, addressId);

    return Response.json(
      { success: true} , 
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/clients/[id]/addresses/[addressId] error', error);

    return Response.json(
      { error: 'Failed to delete address', message: error.message },
      { status: 500 }
    );
  }
}
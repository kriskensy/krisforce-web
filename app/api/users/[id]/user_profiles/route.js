import { getUserProfileByUserId, createUserProfile, updateUserProfile, deleteUserProfile, } from '@/lib/supabase/domains/users/userProfiles';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const profile = await getUserProfileByUserId(id);

    if (!profile) {
      return Response.json(
        { error: 'Not found', message: 'Profile not found' },
        { status: 404 }
      );
    }

    return Response.json(profile, { status: 200 });
  } catch (error) {
    console.error('GET /api/users/[id]/user_profiles error', error);

    return Response.json(
      { error: 'Failed to fetch user profile', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Walidacja podstawowa – możesz rozszerzyć wg potrzeb UI
    if (!body || (body && typeof body !== 'object')) {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      );
    }

    const profile = await createUserProfile(id, body);

    return Response.json(profile, { status: 201 });
  } catch (error) {
    console.error('POST /api/users/[id]/user_profiles error', error);

    const status =
      error.message === 'Profile already exists for this user' ? 409 : 500;

    return Response.json(
      { error: 'Failed to create user profile', message: error.message },
      { status }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!body || (body && typeof body !== 'object')) {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      );
    }

    const profile = await updateUserProfile(id, body);

    return Response.json(profile, { status: 200 });
  } catch (error) {
    console.error('PUT /api/users/[id]/user_profiles error', error);

    const status = error.message === 'Profile not found' ? 404 : 500;

    return Response.json(
      { error: 'Failed to update user profile', message: error.message },
      { status }
    );
  }
}

// Opcjonalny DELETE – używaj tylko jeśli potrzebujesz ręcznego kasowania profilu
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await deleteUserProfile(id);

    return Response.json(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/users/[id]/user_profiles error', error);

    return Response.json(
      { error: 'Failed to delete user profile', message: error.message },
      { status: 500 }
    );
  }
}

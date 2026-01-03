import { getUserProfileById, updateUserProfile, deleteUserProfile } from '@/lib/supabase/domains/users/user_profiles';

export async function GET(request, { params }) {
  try {
    const { id, profileId } = await params;

    const profile = await getUserProfileById(id, profileId);

    return Response.json(profile, { status: 200 });
  } catch (error) {
    console.error('GET /api/users/[id]/profiles/[profileId] error', error);

    return Response.json(
      { error: 'Failed to fetch profile', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id, profileId } = await params;
    const data = await request.json();

    if (!data || typeof data !== 'object') {
      return Response.json(
        { error: 'Validation error', message: 'Invalid payload' },
        { status: 400 }
      );
    }

    const profile = await updateUserProfile(id, profileId, data);

    return Response.json(profile, { status: 200 });
  } catch (error) {
    console.error('PUT /api/users/[id]/profiles/[profileId] error', error);

    return Response.json(
      { error: 'Failed to update profile', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, profileId } = await params;

    await deleteUserProfile(id, profileId);

    return Response.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/users/[id]/profiles/[profileId] error', error);

    return Response.json(
      { error: 'Failed to delete profile', message: error.message },
      { status: 500 }
    );
  }
}
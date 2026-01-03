import { getUserProfiles, createUserProfile } from '@/lib/supabase/domains/users/user_profiles';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const filters = {
      limit: parseInt(searchParams.get('limit')) || 10,
      offset: parseInt(searchParams.get('offset')) || 0,
    };

    const result = await getUserProfiles(filters);

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      },
    });
  } catch (error) {
    console.error('GET /api/users/[id]/profiles error', error);

    return Response.json(
      { error: 'Failed to fetch profiles', message: error.message },
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

    if (!data.first_name || !data.last_name) {
      return Response.json(
        { error: 'Validation error', message: 'first_name and last_name are required' },
        { status: 400 }
      );
    }

    const profile = await createUserProfile(id, data);

    return Response.json(profile, { status: 201 });
  } catch (error) {
    console.error('POST /api/users/[id]/profiles error', error);

    return Response.json(
      { error: 'Failed to create profile', message: error.message },
      { status: 500 }
    );
  }
}
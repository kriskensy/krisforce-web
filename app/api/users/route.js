import { getUsers, createUser } from "@/lib/supabase/domains/users";
import { error } from "console";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search'),
      active: searchParams.get('active') === 'true' ? true : searchParams.get('active') === 'false' ? false : undefined,
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0'),
      orderBy: searchParams.get('orderBy') || 'created_at',
      order: searchParams.get('order') || 'desc',
    }

    const result = await getUsers(filters)

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': result.total
      }
    })
  } catch (error) {
    console.error('GET /api/users error:', error)

    return Response.json(
      { error: 'Failed to fetch users', message: error.message, },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    //validation
    if(!data.email || !data.password) {
      return Response.json(
        { error: 'Validation error', message: 'email and password required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ //simple email validation abc@abc.abc
    if(!emailRegex.test(data.email)) {
      return Response.json(
        { error: 'Validation error', message: 'Invalid email format' },
        { status: 400 }
      )
    }

    if(data.password.length < 12) {
      return Response.json(
        { error: 'Validation error', message: 'Password must be at least 12 characters' },
        { status: 400 }
      )
    }

    const user = await createUser(data)

    return Response.json(user, { status: 201 })

  } catch (error){
    console.error('POST /api/users error:', error)
    return Response.json (
      { error: 'Failed to create user', message: error.message },
      { status: 500 }
    )
  }
}
import { getClients } from "@/lib/supabase/domains/clients/clients";

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
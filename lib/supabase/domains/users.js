import { getServerClient } from "../middleware";

//GET
export async function getUsers(filters = {}) {
  try {
    const {
      search,
      active,
      limit = 10,
      offset = 0,
      orderBy = 'created_at',
      order = 'desc'
    } = filters

    const supabase = await getServerClient()

    let query = supabase
    .from('users')
    .select('id, email, active, created_at, role_id, roles(code, name), user_profiles(id, first_name, last_name, phone)', { count: 'exact' })

      //email or name searching
      if(search) {
        query = query.or(
          `email.ilike.%${search}%,user_profiles.first_name.ilike.%${search}%,user_profiles.last_name.ilike.%${search}%`
        )
      }

      //activity filter
      if(active !== undefined) {
        query = query.eq('active', active)
      }

      //sort + pagination
      query = query
      .order(orderBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase error:', error)

        const errorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error.message)

        throw new Error(`Database error: ${error.message}`)
      }

      return {
        data: data || [],
        total: count || 0,
        limit,
        offset
      }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}
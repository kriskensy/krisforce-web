import { getServerClient } from "../supabase/server";

export async function getAdminDashboardData() {
  const supabase = await getServerClient();

  const [ userStats, permissionStats, totalProducts, totalClients, totalTickets ] = await Promise.all([
    supabase
      .rpc('get_admin_user_stats'),

    supabase
      .from('report_permissions_summary')
      .select('*'),

    supabase
    .from('products')
    .select('*', { count: 'exact', head: true }),

    supabase
    .from('clients')
    .select('*', { count: 'exact', head: true }),

    supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
  ])

  const formattedUserStats = (userStats.data || []).map(s => ({
    name: s.label,
    count: parseInt(s.value || 0, 10)
  }));

  const totalUsers = formattedUserStats.reduce((acc, curr) => acc + curr.count, 0);

  return {
    userStats: formattedUserStats,
    totalUsers,
    permissionStats: permissionStats.data || [],
    totalProducts: totalProducts.count || 0,
    totalClients: totalClients.count || 0,
    totalTickets: totalTickets.count || 0
  };
}
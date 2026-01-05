import { getServerClient } from "../supabase/server";

export async function getAdminDashboardData() {
  const supabase = await getServerClient();

  const { data: userStats } = await supabase.rpc('get_admin_user_stats');

  const { data: permissionStats } = await supabase
    .from('report_permissions_summary')
    .select('*');

  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: totalClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });

  const { count: totalTickets } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true });

  return { userStats, permissionStats, totalProducts, totalClients, totalTickets };
}
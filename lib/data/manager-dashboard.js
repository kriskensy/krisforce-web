import { getServerClient } from "../supabase/server";

export async function getManagerDashboardData() {
  const supabase = await getServerClient();

  const { data: salesStats } = await supabase
    .from('report_global_revenue')
    .select('*');

  const { data: processingStatusess } = await supabase
    .from('order_statuses')
    .select('id')
    .eq('code', 'processing')
    .single()

  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('*, order_statuses(name)')
    .eq('status_id', (processingStatusess).data?.id)
    .limit(5);

  const { data: expiringContracts } = await supabase
    .from('contracts')
    .select('*, clients(name)')
    .filter('end_date', 'lte', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
    .eq('status', 'Active');

  const { data: categoryData } = await supabase
    .from('report_revenue_by_category')
    .select('*')

  return { salesStats, pendingOrders, expiringContracts, categoryData };
}
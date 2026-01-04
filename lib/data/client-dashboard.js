import { getServerClient } from "../supabase/server";

export async function getClientDashboardData(clientId) {
  const supabase = await getServerClient();

  //get client summary
  const { data: summary } = await supabase
    .from('report_client_summary')
    .select('*')
    .eq('client_id', clientId)
    .single();

  //get contracts
  const { data: contracts } = await supabase
    .from('report_contracts')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'Active');

  //get invoices
  const { data: invoices } = await supabase
    .from('report_invoices')
    .select('*')
    .eq('client_id', clientId)
    .eq('status_code', 'issued')
    .order('due_date', { ascending: true })
    .limit(3);

  //get revenue history
  const { data: revenueHistory } = await supabase
    .from('report_revenue_history')
    .select('month_name, total')
    .eq('client_id', clientId)

  const chartData = revenueHistory?.map(item => ({
    month: item.month_name,
    total: parseFloat(item.total)
  })) || [];

  return { summary, contracts, invoices, chartData };
}
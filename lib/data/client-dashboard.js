import { getServerClient } from "../supabase/server";

export async function getClientDashboardData(userId) {
  const supabase = await getServerClient();

  //get client_id
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('client_id')
    .eq('id', userId)
    .single();

  const clientId = userData?.client_id;

  if (!clientId) {
    console.error("User has no client_id assigned");
    return { summary: null, contracts: [], invoices: [], chartData: [] };
  }

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

  //get invoices
  const { data: invoices } = await supabase
    .from('report_invoices')
    .select('*')
    .eq('client_id', clientId)
    .eq('status_code', 'issued')
    .order('due_date', { ascending: true })
    .limit(3);

  // get invoice history
  const { data: invoiceHistory } = await supabase
    .from('report_revenue_history')
    .select('month_name, invoice_count')
    .eq('client_id', clientId);

  const chartData = invoiceHistory?.map(item => ({
    month: item.month_name,
    total: item.invoice_count
  })) || [];

  return { summary, contracts, invoices, chartData };
}
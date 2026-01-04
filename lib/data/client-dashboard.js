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

  return { summary, contracts, invoices };
}
import { getServerClient } from "../supabase/server";

export async function getSupportDashboardData(agentId) {
  const supabase = await getServerClient();

  const [ticketsRes, commentsRes, totalRes, openRes] = await Promise.all([
    supabase
      .from('tickets')
      .select('priority_id, ticket_priorities(code), ticket_statuses(code)')
      .eq('assigned_to', agentId)
      .is('deleted_at', null),

    supabase
      .from('ticket_comments')
      .select('created_at, tickets!inner(subject)')
      .eq('tickets.assigned_to', agentId)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('report_tickets')
      .select('status_name', { count: 'exact' }),

    supabase
      .from('report_tickets_open')
      .select('*', { count: 'exact', head: true })
  ]);

  //prepare chart data
  const chartGroups = (totalRes.data || []).reduce((acc, curr) => {
    acc[curr.status_name] = (acc[curr.status_name] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(chartGroups).map(([name, count]) => ({
    status: name,
    count: count
  }));

  return { 
    tickets: ticketsRes.data || [], 
    recentComments: commentsRes.data || [], 
    ticketsTotal: totalRes.count || 0,
    ticketsOpen: openRes.count || 0,
    chartData 
  };
}
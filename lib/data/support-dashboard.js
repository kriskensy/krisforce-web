import { getServerClient } from "../supabase/server";

export async function getSupportDashboardData(agentId) {
  const supabase = await getServerClient();

  const { data: tickets } = await supabase
    .from('tickets')
    .select('status_id, priority_id, ticket_statuses(code, name), ticket_priorities(code, name)')
    .eq('assigned_to', agentId)
    .is('deleted_at', null);

  const { data: recentComments } = await supabase
    .from('ticket_comments')
    .select('*, tickets!inner(subject)')
    .eq('tickets.assigned_to', agentId)
    .order('created_at', { ascending: false })
    .limit(3);

  return { tickets, recentComments };
}
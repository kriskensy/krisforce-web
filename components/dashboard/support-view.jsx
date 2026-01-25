import { getServerClient } from "@/lib/supabase/server";
import { getSupportDashboardData } from "@/lib/data/support-dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardBarChart } from "@/components/dashboard/dashboard-barchart";

export default async function SupportDashboardView({ agentId }) {
  const supabase = await getServerClient();

  const { tickets, recentComments, ticketsTotal, ticketsOpen, chartData } = await getSupportDashboardData(agentId);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard 
        title="My Workload"
        value={`${tickets?.filter(t => t.ticket_statuses.code !== 'closed').length || 0} Active`}
        subtitle="Tickets assigned to you"
        details={[
          { label: "Critical Priority", value: tickets?.filter(t => t.ticket_priorities.code === 'critical').length || 0 },
          { label: "High Priority", value: tickets?.filter(t => t.ticket_priorities.code === 'high').length || 0 },
          { label: "Normal Priority", value: tickets?.filter(t => t.ticket_priorities.code === 'normal').length || 0 },
          { label: "Low Priority", value: tickets?.filter(t => t.ticket_priorities.code === 'low').length || 0 }
        ]}
      />

      <StatCard 
        title="Open Tickets" 
        value={ticketsOpen || 0} 
        subtitle="Tickets waiting for support" 
      />

      <StatCard 
        title="Total Tickets" 
        value={ticketsTotal || 0} 
        subtitle="Total active tickets" 
      />

      <div className="md:col-span-2">
        <DashboardBarChart 
          title="Global Status Distribution"
          data={chartData}
          labelKey="status"
          dataKey="count"
          barColor="#4f46e5"
        />
      </div>

      <StatCard 
        title="Recent Client Activity"
        value="Comments"
        subtitle="Latest responses on your tickets"
        details={recentComments?.map(comment => ({
          label: comment.tickets.subject.substring(0, 15) + "...",
          value: new Date(comment.created_at).toLocaleDateString()
        }))}
      />
    </div>
  );
}
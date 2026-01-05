import { getServerClient } from "@/lib/supabase/server";
import { getManagerDashboardData } from "@/lib/data/manager-dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardBarChart } from "@/components/dashboard/dashboard-barchart";

export default async function ManagerDashboardView() {
  const supabase = await getServerClient();

  const { salesStats, pendingOrders, expiringContracts, categoryData } = await getManagerDashboardData();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard 
        title="Total Revenue"
        value={`${salesStats?.total_sum || "0,00"} €`}
        subtitle="Gross revenue this fiscal year"
      />

      <StatCard 
        title="Contract Renewals"
        value={expiringContracts?.length || 0}
        badge={expiringContracts?.length > 0 ? "Action Required" : null}
        subtitle="Expiring in next 30 days"
        details={expiringContracts?.map(c => ({
          label: c.clients.name,
          value: c.contract_number
        }))}
      />

      <StatCard 
        title="Pending Orders"
        value={pendingOrders?.length || 0}
        subtitle="Orders in 'Processing' status"
        details={pendingOrders?.map(o => ({
          label: o.order_number,
          value: o.order_statuses?.name || "Processing"
        }))}
      />

      <div className="lg:col-span-3">
        <DashboardBarChart 
          title="Revenue by Product Category"
          data={categoryData || []}
          unit="€"
          dataKey="total"
          labelKey="category"
        />
      </div>
    </div>
  );
}
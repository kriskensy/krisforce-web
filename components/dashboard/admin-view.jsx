import { getServerClient } from "@/lib/supabase/server";
import { getAdminDashboardData } from "@/lib/data/admin-dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardBarChart } from "@/components/dashboard/dashboard-barchart";

export default async function AdminDashboardView() {
    const supabase = await getServerClient();

  const { userStats, totalUsers, permissionStats, totalProducts, totalClients, totalTickets } = await getAdminDashboardData();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Active Clients" 
        value={totalClients || 0} 
        subtitle="Registered companies" 
      />
      
      <StatCard 
        title="Product Catalog" 
        value={totalProducts || 0} 
        subtitle="Total items in store" 
      />

      <StatCard 
        title="Support Load" 
        value={totalTickets || 0} 
        subtitle="All tickets in system"
      />

      <StatCard 
        title="User Base" 
        value={totalUsers}
        subtitle="Across all roles"
      />

      <div className="lg:col-span-2">
        <DashboardBarChart 
          title="Users per Role"
          data={userStats}
          labelKey="name"
          dataKey="count"
          barColor="#6366F1"
        />
      </div>

      <div className="lg:col-span-2">
        <StatCard 
          title="Role Permissions (Nav Tabs)"
          value="Access Control"
          subtitle="Tabs assigned per role"
          details={permissionStats?.map(p => ({
            label: p.role_name,
            value: `${p.assigned_tabs} tabs`
          }))}
        />
      </div>
    </div>
  );
}
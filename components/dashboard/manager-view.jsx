import { getManagerDashboardData } from "@/lib/data/manager-dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardBarChart } from "@/components/dashboard/dashboard-barchart";

export default async function ManagerDashboardView() {
  const data = await getManagerDashboardData();

  const { totalRevenue, totalDebt, activeOrders, expiringContracts, revenueTrend, categoryDistribution, orderStatusStats, allContracts } = await getManagerDashboardData();

  const formatEuro = (val) => 
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="space-y-8 p-8">
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={formatEuro(totalRevenue)} subtitle="All time global income" />
        <StatCard title="Outstanding Debt" value={formatEuro(totalDebt)} subtitle="Total unpaid invoices" />
        <StatCard title="Active Orders" value={activeOrders} subtitle="Volume of all orders" />
        <StatCard title="Expiring Contracts" value={expiringContracts} subtitle="Due within 30 days" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardBarChart 
          title="Monthly Revenue Trend (€)"
          data={revenueTrend}
          labelKey="name"
          dataKey="value"
          barColor="#10b981"
        />
        <DashboardBarChart 
          title="Revenue by Category (€)"
          data={categoryDistribution}
          labelKey="name"
          dataKey="value"
          barColor="#6366f1"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatCard 
          title="Order Status Pipeline"
          value="Fulfillment"
          details={orderStatusStats.map(s => ({
            label: s.name,
            value: `${s.count} orders`
          }))}
        />
        <StatCard 
          title="Critical Contracts"
          value="Sales & Customers"
          details={allContracts
            .filter(c => c.status !== 'Active')
            .map(c => ({
              label: c.contract_number,
              value: `${c.status} (${c.end_date})`
            }))}
        />
      </div>
    </div>
  );
}
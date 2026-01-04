import { getServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { getClientDashboardData } from "@/lib/data/client-dashboard";
import { DashboardBarChart } from "@/components/dashboard/dashboard-barchart";

export default async function ClientDashBoardView ({ userId }) {
    const supabase = await getServerClient();

  //get client data
  const { summary, contracts, invoices, chartData } = await getClientDashboardData(userId);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Revenue Overview"
          value={<div className="text-3xl font-bold text-[#0176D3]">
                  {summary?.total_revenue || "0,00"} €
                </div>
          }
          subtitle="Total invoiced this month"
        />

        <StatCard 
          title="Support Activity"
          value={`${summary?.open_tickets || 0} Open Tickets`}
          badge={summary?.open_tickets > 0 ? "Action Required" : null}
          details={[
            { label: "Critical Priority", value: summary?.critical_tickets || "0" },
            { label: "Waiting for response", value: summary?.pending_tickets || "0" }
          ]}
        />

        <StatCard
          title="Active Contracts"
          value={contracts?.length || "0"}
          subtitle="Current service agreements"
          details={contracts?.map(contract => ({
            label: contract.contract_number,
            value: new Date(contract.end_date).toLocaleDateString()
          }))}
        />

        <div className="lg:col-span-2">
          <DashboardBarChart 
             data={chartData} 
             title="Revenue History (Last 6 Months)"
             dataKey="total"
             unit="€"
          />
        </div>

        <StatCard
          title="Upcoming Payments"
          value={invoices?.[0]?.total_amount ? `${invoices[0].total_amount} €` : "0.00 €"}
          subtitle="Next payment due soon"
          badge={invoices?.length > 0 ? "Pending" : null}
          details={invoices?.map(invoice => ({
            label: invoice.invoice_number,
            value: invoice.due_date
          }))}
        />     
    </div>
  )
}
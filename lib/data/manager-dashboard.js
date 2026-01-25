import { getServerClient } from "../supabase/server";

export async function getManagerDashboardData() {
  const supabase = await getServerClient();

  const [ globalRev, revHistory, revByCategory, ordersByStatus, contracts, invoices, orders, payments, clientSummary ] = await Promise.all([
    supabase
      .from('report_global_revenue')
      .select('*'),

    supabase
      .from('report_revenue_history')
      .select('*'),

    supabase
      .from('report_revenue_by_category')
      .select('*'),

    supabase
      .from('report_orders_by_status')
      .select('*'),

    supabase
      .from('report_contracts')
      .select('*'),

    supabase
      .from('report_invoices')
      .select('*'),

    supabase
      .from('report_orders')
      .select('*'),

    supabase
      .from('report_payments')
      .select('*'),

    supabase
      .from('report_client_summary')
      .select('current_debt')
  ]);

  //preparing data for charts
  const revenueTrend = (globalRev.data || []).map(d => ({ 
    name: d.month, 
    value: parseFloat(d.total || 0) 
  }));

  const categoryDistribution = (revByCategory.data || []).map(d => ({ 
    name: d.category, 
    value: parseFloat(d.total || 0) 
  }));

  const orderStatusStats = (ordersByStatus.data || []).map(d => ({ 
    name: d.status_name, 
    count: parseInt(d.order_count || 0) 
  }));

  const totalRevenue = (globalRev.data || []).reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0);
  const totalDebt = (clientSummary.data || []).reduce((acc, curr) => acc + parseFloat(curr.current_debt || 0), 0);
  const activeOrders = (orders.data || []).length;
  const expiringContracts = (contracts.data || []).filter(c => c.status === 'Expiring Soon').length;

  return {
    totalRevenue,
    totalDebt,
    activeOrders,
    expiringContracts,
    revenueTrend,
    categoryDistribution,
    orderStatusStats,
    allContracts: contracts.data || []
  };
}
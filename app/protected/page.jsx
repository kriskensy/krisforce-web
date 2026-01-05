import { getServerClient } from "@/lib/supabase/server";
import AdminDashboardView from "@/components/dashboard/admin-view"
import ManagerDashboardView from "@/components/dashboard/manager-view"
import SupportDashboardView from "@/components/dashboard/support-view"
import ClientDashboardView from "@/components/dashboard/client-view"

export default async function ProtectedPage() {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  //get user data with role
  const { data: userData } = await supabase
    .from('users')
    .select('*, roles(code)')
    .eq('id', user.id)
    .single()

  const userRole = userData?.roles?.code;

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Welcome back!</h2>
        <p className="text-muted-foreground text-sm">Here is what's happening with your workspace today.</p>
      </header>

      {userRole === 'admin' && <AdminDashboardView />}
      {userRole === 'manager' && <ManagerDashboardView />}
      {userRole === 'support' && <SupportDashboardView agentId={userData.id}/>}
      {userRole === 'user' && <ClientDashboardView userId={userData.id} />}

    </div>
  );
}
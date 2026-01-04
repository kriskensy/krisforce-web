import { getServerClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { Navbar } from "@/components/protected/Navbar";
import { NavigationMenu } from "@/components/protected/Navigation-menu";

export default async function ProtectedLayout({ children }) {
  
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  //get CMS data for navbar
  const { data: cmsContent } = await supabase
    .from('site_content')
    .select('*')
    .in('section', ['navbar']);

  const navbarContent = cmsContent?.filter(item => item.section === 'navbar');

  //get user role for navigation
  const { data: userData } = await supabase
    .from('users')
    .select('role_id, roles(code)')
    .eq('id', user?.id)
    .single();

  const roleCode = userData?.roles?.code || 'user';

  //get navigation tabs for roles
  const { data: visibleTabs } = await supabase
    .from('nav_tabs')
    .select('label, href, nav_tabs_roles!inner(role_id)')
    .eq('nav_tabs_roles.role_id', userData?.role_id)
    .eq('active', true)
    .order('order_index');

  return (
    <main className="h-[100vh] min-h-[720px] max-h-[1200px]  flex flex-col bg-[#F3F3F3] dark:bg-[#0B0E14]">
      <Navbar content={navbarContent}/>
      <NavigationMenu tabs={visibleTabs || []}/>

      {/* content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[70vh]">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </main>
  );
}
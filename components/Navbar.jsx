import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";
import Link from "next/link";
import { Search, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServerClient } from "@/lib/supabase/server";

export const Navbar = async ({ content }) => {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  //for easier access
  const getCmsNavbarValue = (key, fallback) => content?.find(item => item.key === key)?.value || fallback;

  return (
    <header className="h-14 border-b bg-white dark:bg-[#161B22] flex items-center px-4 justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6 flex-1">
        <Link href="/" className="flex items-center gap-2">
          <img className="h-8 w-auto"
            src={getCmsNavbarValue('nav_brand_logo', 'KrisForce Logo')}
          />
          <span className="font-bold text-lg tracking-tight hidden md:block">
            {getCmsNavbarValue('nav_brand_name', 'KrisForce')}
          </span>
        </Link>

        {user && (
        <div className="max-w-md w-full relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search KrisForce..." 
            className="pl-10 bg-[#F3F3F3] dark:bg-[#0D1117] border-none focus-visible:ring-1 h-9"
          />
        </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground"><Bell className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground"><Settings className="h-5 w-5" /></Button>
        <div className="h-6 w-[1px] bg-border mx-2" />
        <ThemeSwitcher />
        <Suspense><AuthButton /></Suspense>
      </div>
    </header>
  );
};
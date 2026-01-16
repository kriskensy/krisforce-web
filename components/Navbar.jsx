import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";
import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchForm } from "./SearchForm";
import { NotificationBell } from "./NotificationBell";

export const Navbar = ({ content, user }) => {

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
        <SearchForm />
        )}
      </div>

      <div className="flex items-center gap-3">
        {user ? <NotificationBell /> : <Bell className="h-5 w-5 text-muted-foreground opacity-50" />}
        <Button variant="ghost" size="icon" className="text-muted-foreground"><Settings className="h-5 w-5" /></Button>
        <div className="h-6 w-[1px] bg-border mx-2" />
        <ThemeSwitcher />
        <Suspense fallback={<div className="w-20 h-8 bg-muted animate-pulse rounded" />}>
          <AuthButton />
        </Suspense>
      </div>
    </header>
  );
};
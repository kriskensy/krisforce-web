import { getServerClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";

export default async function Home() {
  const supabase = await getServerClient();

  //cms data from DB
  const { data: content } = await supabase
    .from('Site_content')
    .select('*');

  //helper for displaying default
  const getCms = (key, fallback) => content?.find(item => item.key === key)?.value || fallback;

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <span className="text-lg tracking-tight">
                {getCms('nav_brand_name', 'KrisForce')}
              </span>              
            </div>
            <div className="flex gap-2 items-center">
              <ThemeSwitcher />
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Hero
            title={getCms('hero_title', 'Innovative Solutions')}
            subtitle={getCms('hero_subtitle', 'Scaling your business made easy.')}
          />
          <main className="flex-1 flex flex-col gap-6 px-4">
{/* other sections */}
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          {getCms('footer_text', '© 2026 KrisForce. All rights reserved.')}
        </footer>
      </div>
    </main>
  );
}

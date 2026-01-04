import { getServerClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";

export default async function Home() {
  const supabase = await getServerClient();

  //cms data from DB
  const { data: content, error } = await supabase
    .from('site_content')
    .select('*');

  //helper for displaying new value or default
  const getCms = (key, fallback) => {
    const item = content?.find(i => i.key === key);
    return item?.value || fallback;
  };

  return (
    <main className="flex flex-col items-center">
      <div className=" w-full flex flex-col gap-8 items-center">
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
        <div className="w-full">
          <Hero
            title={getCms('hero_title', 'Innovative Solutions')}
            subtitle={getCms('hero_subtitle', 'Scaling your business made easy.')}
            bgImage={getCms('hero_bg_image', '/default-hero.jpg')}
          />
        </div>
      </div>
    </main>
  );
}

import { getServerClient } from "@/lib/supabase/server";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/Navbar";

export default async function Home() {
  const supabase = await getServerClient();

  //cms data from DB
  const { data: cmsContent, error } = await supabase
    .from('site_content')
    .select('*')
    .in('section', ['navbar', 'hero']);

  const navbarContent = cmsContent?.filter(item => item.section === 'navbar');

  //helper for displaying new value or default
  const getCms = (key, fallback) => {
    const item = cmsContent?.find(i => i.key === key);
    return item?.value || fallback;
  };

  return (
    <main className="flex flex-col items-center">
      <div className="w-full sticky top-0 z-50 bg-background/95 backdrop-blur">
        <Navbar content={navbarContent}/>
      </div>
        <div className="w-full">
          <Hero
            title={getCms('hero_title', 'Innovative Solutions')}
            subtitle={getCms('hero_subtitle', 'Scaling your business made easy.')}
            bgImage={getCms('hero_bg_image', '/default-hero.jpg')}
          />
        </div>
    </main>
  );
}
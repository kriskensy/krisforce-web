import { getServerClient } from "@/lib/supabase/server";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/Navbar";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const authMode = params?.auth;

  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  //cms data from DB
  const { data: cmsContent, error } = await supabase
    .from('site_content')
    .select('*')
    .in('section', ['about', 'navbar', 'hero']);

  const navbarContent = cmsContent?.filter(item => item.section === 'navbar');
  const aboutData = cmsContent?.filter(item => item.section === 'about');

  //helper for displaying new value or default
  const getCms = (key, fallback) => {
    const item = cmsContent?.find(i => i.key === key);
    return item?.value || fallback;
  };

  return (
    <main className="flex-1 flex flex-col items-center">
      <div className="w-full sticky top-0 z-50 bg-background/95 backdrop-blur">
        <Navbar content={navbarContent}/>
      </div>
        <div className="w-full flex-1 flex flex-col">
          <Hero
            title={getCms('hero_title', 'Innovative Solutions')}
            subtitle={getCms('hero_subtitle', 'Scaling your business made easy.')}
            bgImage={getCms('hero_bg_image', '/default-hero.jpg')}
            userIsLoggedIn={!!user}
            authMode={authMode}
            marketingContent={aboutData}
          />
        </div>
    </main>
  );
}
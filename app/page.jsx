import { getPublicServerClient } from "@/lib/supabase/server";
import { getServerClient } from "@/lib/supabase/server";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/Navbar";
import { Suspense } from "react";

function HomeView({ cmsContent, user, authMode }) {
  const navbarContent = cmsContent?.filter(item => item.section === 'navbar');
  const aboutData = cmsContent?.filter(item => item.section === 'about');

  //helper for displaying new value or default
  const getCms = (key, fallback) => {
    const item = cmsContent?.find((i) => i.key === key);
    return item?.value || fallback;
};

  return (
    <main className="flex-1 flex flex-col items-center">
      <div className="w-full sticky top-0 z-50 bg-background/95 backdrop-blur">
        <Navbar 
          content={navbarContent}
          user={user}
        />
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

async function HomeContent({ authMode }) {
  const supabase = await getServerClient(); //to get User and userIsLoggedIn via cookies
  const publicSupabase = getPublicServerClient(); //to get data CMS. Static client

  const [userResult, cmsResult] = await Promise.all([
    supabase.auth.getUser(),
    publicSupabase
      .from('site_content')
      .select('*')
      .in('section', ['about', 'navbar', 'hero'])
  ]);

  return (
    <HomeView
      cmsContent={cmsResult.data}
      user={userResult.data?.user}
      authMode={authMode}
    />
  )
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const authMode = params?.auth;

  return (
    <Suspense fallback={<HomeView cmsContent={[]} user={null} authMode={authMode} />}>
      <HomeContent authMode={authMode}/>
    </Suspense>
  )
};
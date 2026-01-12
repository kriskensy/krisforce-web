import { getPublicServerClient } from "@/lib/supabase/server";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Suspense } from "react";
import "./globals.css";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

async function FooterContent() {
  const supabase = getPublicServerClient();

  const { data: cmsContent } = await supabase
    .from('site_content')
    .select('*')
    .in('section', ['footer'])

  const footerContent = cmsContent?.filter((item) => item.section === 'footer');
  
  return <Footer content={footerContent} />
}

export default function RootLayout({ children }) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        <Suspense fallback={<Footer content={null} />}>
          <FooterContent />
        </Suspense>
      </body>
    </html>
  );
}

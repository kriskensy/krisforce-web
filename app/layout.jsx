import { getServerClient } from "@/lib/supabase/server";
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

export default async function RootLayout({ children }) {
  const supabase = await getServerClient();

  const { data: cmsContent } = await supabase
    .from('site_content')
    .select('*')
    .in('section', 'footer')

  const footerContent = cmsContent?.filter(item => item.section === 'footer');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
          <Suspense fallback={null}>
            <Footer content={footerContent}/>
          </Suspense>
        </ThemeProvider>          
      </body>
    </html>
  );
}

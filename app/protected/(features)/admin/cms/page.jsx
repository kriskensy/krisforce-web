import { getServerClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ContentEditor from "@/components/admin/ContentEditor";
import { verifyAccessLevel } from "@/lib/utils/auth/verifyAccessLevel";
import { redirect } from "@/node_modules/next/navigation";

export default async function CMSPage() {
  try {
    await verifyAccessLevel(3);//admin
  } catch (error) {
    redirect('/');
  }
  
  const supabase = await getServerClient();
  
  const { data: content } = await supabase
    .from('site_content')
    .select('*');

  //section groups
  const section = [...new Set(content.map(item => item.section))];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Website content manager</h1>

      <Tabs defaultValue={section[0]} className="w-full">
        <TabsList className="mb-8">
          {section.map(section => (
            <TabsTrigger key={section} value={section} className="capitalize">{section}</TabsTrigger>
          ))}
        </TabsList>

        {section.map(section => (
          <TabsContent key={section} value={section} className="space-y-6">
            <div className="grid gap-6 border p-6 rounded-lg bg-card">
              {content.filter(item => item.section === section).map(item => (
                <ContentEditor key={item.id} item={item}/>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
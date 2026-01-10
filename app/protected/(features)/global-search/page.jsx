import { getServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { GlobalSearchHeader } from "@/components/GlobalSearchHeader";

export default async function SearchResultsPage({ searchParams }) {
  const query = (await searchParams).q; //query -> object,  q -> key with value
  if (!query) redirect('/protected');

  const supabase = await getServerClient();

  //DB rpc search function
  const { data: results, error } = await supabase.rpc('global_search', {
    search_query: query
  });

  if (error) return <div className="p-8 text-destructive text-center">Search error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-[#F3F3F3] dark:bg-[#0B0E14] p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white dark:bg-card border border-border rounded-[2rem] shadow-sm p-8 md:p-12">
          <GlobalSearchHeader query={query} />

          {/* sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {results && Object.entries(results).map(([section, items]) => (
              items && items.length > 0 && (
                <div 
                  key={section} 
                  className="flex flex-col border border-border rounded-2xl bg-muted/10 dark:bg-muted/5 w-full transition-all hover:shadow-md h-full"
                >
                  <div className="px-6 py-4 border-b border-border bg-muted/20 rounded-t-2xl">
                    <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      {section}
                    </h2>
                  </div>

                  <div className="flex-1 p-2">
                    {items.map((item) => (
                      <Link 
                        key={item.id}
                        href={`/protected/${section}/${item.id}`}
                        className="group flex items-center justify-between px-4 py-4 rounded-xl hover:bg-white dark:hover:bg-card hover:shadow-sm transition-all border border-transparent hover:border-border mb-1"
                      >
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[15px] font-bold text-foreground group-hover:text-primary truncate">
                            {item.title}
                          </span>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                  
                  <div className="px-6 py-3 border-t border-border bg-muted/5 text-[10px] text-muted-foreground font-semibold">
                    {items.length} {items.length === 1 ? 'RECORD' : 'RECORDS'} FOUND
                  </div>
                </div>
              )
            ))}
          </div>

          {/* no results */}
          {(!results || !Object.values(results).some(arr => arr && arr.length > 0)) && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                 <Search size={40} className="text-muted-foreground/40" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">No matches found</h3>
              <p className="text-muted-foreground max-w-sm mt-2 font-medium">
                We couldn't find any records matching your query in the database.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
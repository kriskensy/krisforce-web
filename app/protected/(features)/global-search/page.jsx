import { getServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { GlobalSearchHeader } from "@/components/GlobalSearchHeader";
import GlobalSearchResultsList from "@/components/GlobalSearchResultsList";

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
          
          <GlobalSearchResultsList results={results} />

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
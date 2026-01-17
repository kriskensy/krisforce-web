import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";

export default async function MySupportLayout({ children }) {
  const supabase = await getServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?error=unauthenticated");
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select("client_id")
    .eq("id", user.id)
    .single();

  if (error || !userData?.client_id) {
    redirect("//protected?error=unauthorized");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {children}
    </div>
  );
}
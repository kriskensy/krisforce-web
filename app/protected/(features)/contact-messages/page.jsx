import { getServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MessagesList from "./MessagesListWrapper";
import { getUserAccessLevel } from "@/lib/utils/auth/getUserAccessLevel";

export default async function ContactMessagesHubPage() {
  const supabase = await getServerClient();
  const access = await getUserAccessLevel();

  const { data: messages, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching messages:", error);
    return <div className="p-8 text-destructive">Error loading messages. Please check your permissions.</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-muted-foreground">
            Manage inquiries from the contact form.
          </p>
        </div>
      </div>

      <MessagesList
        initialMessages={messages}
        userLevel={access.level}
        tableKey="contact_messages"
      />
    </div>
  );
}
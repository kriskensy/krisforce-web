import { getUserAccessLevel } from "@/lib/utils/auth/getUserAccessLevel";
import { redirect } from "next/navigation";

export default async function ContactMessagesLayout({ children }) {
  const access = await getUserAccessLevel();

  if (!access || access.level < 2) {
    redirect('/protected?error=unauthorized');
  }

  return <>{children}</>;
}
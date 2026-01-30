import { getUserAccessLevel } from "@/lib/utils/auth/getUserAccessLevel";
import { redirect } from "next/navigation";

export default async function TicketsHubPage({ children }) {
  const access = await getUserAccessLevel();

  if (!access || access.level < 1) {
    redirect('/protected?error=unauthorized');
  }

  return <>{children}</>;
}
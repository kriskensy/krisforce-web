import { getUserAccessLevel } from "@/lib/utils/auth/getUserAccessLevel";
import { redirect } from "next/navigation";

export default async function ReportsLayout({ children }) {
  let isAuthorized = false;

  try {
    const access = await getUserAccessLevel();
    if (access && access.level >= 2) {
      isAuthorized = true;
    }
  } catch (error) {
    console.error("Access verification failed:", error.message);
  }

  if (!isAuthorized) {
    redirect('/protected?error=unauthorized_reports');
  }

  return <>{children}</>;
}
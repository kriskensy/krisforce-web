import { verifyAdmin } from "@/lib/utils/auth/verifyAdmin";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  let isAuthorized = false;

  try {
    const user = await verifyAdmin();
    if (user) isAuthorized = true;
  } catch (error) {
    console.error("Admin verification failed:", error.message);
  }

  if (!isAuthorized) {
    redirect('/protected');
  }

  return <>{children}</>;
}
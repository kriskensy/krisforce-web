import { getUserAccessLevel } from "@/lib/utils/auth/getUserAccessLevel";
import { redirect } from "next/navigation";

export default async function ProductsLayout({ children }) {
  const access = await getUserAccessLevel();

  if (!access || access.level < 0) {//TODO display only products for clients
    redirect('/protected?error=unauthorized');
  }

  return <>{children}</>;
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Auth guard for /admin (dashboard). Redirects to /admin/login if cookie not set.
 * Does not wrap /admin/login, so login page is accessible without cookie.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_authenticated")?.value;
  if (auth !== "true") {
    redirect("/admin/login");
  }
  return <>{children}</>;
}

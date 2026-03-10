import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function loginAction(formData: FormData) {
  "use server";
  const password = formData.get("password");
  const value = typeof password === "string" ? password : "";
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (value === expected && expected !== "") {
    const cookieStore = await cookies();
    cookieStore.set("admin_authenticated", "true", {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });
    redirect("/admin");
  }
  redirect("/admin/login?error=incorrect");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const showError = params.error === "incorrect";

  return (
    <div className="max-w-sm">
      <h1
        className="mb-6 font-serif text-[#1B2A4A] text-2xl"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        Admin login
      </h1>
      <form action={loginAction} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-[#6B7280]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full border border-[#E5E7EB] px-3 py-2 text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
            autoComplete="current-password"
          />
        </div>
        {showError && (
          <p className="text-sm text-red-600">Incorrect password.</p>
        )}
        <button
          type="submit"
          className="bg-[#1B2A4A] px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#2D5016]"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

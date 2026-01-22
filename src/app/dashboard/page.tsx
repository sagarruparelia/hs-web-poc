import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { firstName, lastName, email } = session.user;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Welcome back!
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              First Name
            </p>
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {firstName || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Last Name
            </p>
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {lastName || "N/A"}
            </p>
          </div>
          {email && (
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Email</p>
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {email}
              </p>
            </div>
          )}
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { isClerkConfigured } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default function SignInPage() {
  if (!isClerkConfigured()) {
    redirect("/login");
  }

  return (
    <div className="section-y min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-6 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
            The Citizen Project &bull; South Tongu
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ocean-950 dark:text-white">
            Sign In with Clerk
          </h1>
          <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400">
            Secure authentication managed by Clerk &bull; Role permissions enforced by Supabase
          </p>
        </div>

        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-md",
              card: "shadow-xl border border-ocean-200 dark:border-ocean-800 rounded-3xl p-6 bg-white dark:bg-ocean-900",
              headerTitle: "text-ocean-950 dark:text-white font-display",
              headerSubtitle: "text-ocean-600 dark:text-ocean-400 text-xs",
            },
          }}
        />

        <div className="mt-6 text-center text-xs text-ocean-500">
          <span>Prefer direct local portal login? </span>
          <Link
            href="/login"
            className="font-medium text-emerald-600 hover:text-emerald-700 underline dark:text-emerald-400"
          >
            Use District Portal Form &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

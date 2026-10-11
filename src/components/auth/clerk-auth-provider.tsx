import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { isClerkPublishableKeyValid } from "@/lib/rbac";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isValidKey = isClerkPublishableKeyValid(publishableKey);

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  if (isValidKey && publishableKey) {
    return (
      <ClerkProvider
        publishableKey={publishableKey}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/user"
        afterSignUpUrl="/user"
      >
        {children}
      </ClerkProvider>
    );
  }

  return <>{children}</>;
}

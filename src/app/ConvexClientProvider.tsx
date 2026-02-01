"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const hasClerk = clerkKey && !clerkKey.includes("placeholder");
const hasConvex = !!convexUrl && !convexUrl.includes("placeholder");

const convex = hasConvex ? new ConvexReactClient(convexUrl) : null;

function FullProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex!} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (hasClerk && hasConvex) {
    return <FullProvider>{children}</FullProvider>;
  }
  // Dev mode: run without Clerk/Convex
  return <>{children}</>;
}

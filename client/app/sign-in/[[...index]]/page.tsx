"use client";

import { SignIn } from "@clerk/nextjs";
import { clerkAppearanceDark, clerkAppearanceLight } from "@/lib/clerkAppearance";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FeatureNavbar } from "@/components/ui/featureNavbar";


export default function SignInPage() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which theme to use
  const currentTheme = mounted ? (resolvedTheme || theme) : "dark";
  const appearance = currentTheme === "dark" ? clerkAppearanceDark : clerkAppearanceLight;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <FeatureNavbar onOpenSidebar={() => {}} />
      <SignIn
        appearance={appearance}
        routing="path"
        path="/sign-in"
      />
    </div>
  );
}
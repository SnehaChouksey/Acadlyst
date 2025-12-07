"use client";

import { SignUp } from "@clerk/nextjs";
import { clerkAppearanceDark, clerkAppearanceLight } from "@/lib/clerkAppearance";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Nav } from "@/components/ui/nav";

export default function SignUpPage() {
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
    <div className="relative flex min-h-screen items-center justify-center bg-background">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Nav onOpenSidebar={() => {}} />
      </div>
      <div className="z-10 mt-10">
        <SignUp
          appearance={appearance}
          routing="path"
          path="/sign-up"
        />
      </div>
    </div>
  );
}
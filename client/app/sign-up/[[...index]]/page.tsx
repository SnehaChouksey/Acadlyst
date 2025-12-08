"use client";

import { SignUp } from "@clerk/nextjs";
import { clerkAppearanceDark, clerkAppearanceLight } from "@/lib/clerkAppearance";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Nav } from "@/components/ui/nav";
import DiamondGridBackground from "@/components/ui/DiamondGridBackground";

export default function SignUpPage() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme) : "dark";
  const appearance =
    currentTheme === "dark" ? clerkAppearanceDark : clerkAppearanceLight;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <DiamondGridBackground />
      </div>

      {/* Foreground */}
      <div className="relative z-10 flex min-h-screen items-center justify-center bg-background/30">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Nav onOpenSidebar={() => {}} />
        </div>

        <div className="mt-10">
          <SignUp
            appearance={appearance}
            routing="path"
            path="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}

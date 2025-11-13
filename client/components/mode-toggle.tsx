"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [hydrated, setHydrated] = React.useState(false);

  // Ensure correct theme only after hydration
  React.useEffect(() => {
    setHydrated(true);
  }, []);

  // Toggle between 'light' and 'dark'
  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // SSR: fallback, show static icons; CSR: show toggleable icons
  return (
    <span
      onClick={handleToggle}
      style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", position: "relative" }}
      aria-label="Toggle theme"
      tabIndex={0}
      role="button"
    >
      <Sun
        className={`h-[1.7rem] w-[1.7rem] transition-all ${
          hydrated ? (theme === "dark" ? "scale-0 -rotate-90 absolute" : "scale-100 rotate-0") : "scale-100 rotate-0"
        }`}
      />
      <Moon
        className={`h-[1.7rem] w-[1.7rem] transition-all ${
          hydrated ? (theme === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90 absolute") : "scale-0 rotate-90 absolute"
        }`}
      />
    </span>
  );
}

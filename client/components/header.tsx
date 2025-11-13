"use client";

import { ModeToggle } from "@/components/mode-toggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { NavigationMenuMain } from "@/components/ui/navbar";

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur support-backdrop-blur">
      <div className="flex justify-end items-center p-4 gap-4 h-16">
        <ModeToggle />
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="bg-[#ff0084] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <div className="absolute top-0 left-7 h-16 flex items-center justify-center">
        <img src="/acadlyst_logo.png" alt="Acadlyst Logo" className="w-12 h-12" />
        <div className="ml-2 font-bold text-2xl">Acadlyst</div>
      </div>

      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 bg-foreground/10 rounded-full px-4 py-1">
        <NavigationMenuMain />
      </div>
    </header>
  );
}

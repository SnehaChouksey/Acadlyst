"use client";

import { ModeToggle } from "@/components/mode-toggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export function FeatureNavbar() {
  return (
    <div className="fixed top-0 left-0 py-0.5 w-full z-50 bg-background backdrop border-b border-accent/20">
      <div className="flex justify-end items-center p-4 gap-4 h-15">
        <ModeToggle />
        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:opacity-90 transition">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <div className="absolute top-0 left-3 mt-1 h-16 flex items-center justify-center">
        <img src="/acadlyst_logo.png" alt="Acadlyst Logo" className="w-12 h-12 mt-1" />
        <div className="ml-2 font-bold text-2xl">Acadlyst</div>
      </div>

    </div>
  );
}

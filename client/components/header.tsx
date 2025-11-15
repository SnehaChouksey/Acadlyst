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
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur">
      {/* ✔ TOP BAR */}
      <div className="flex justify-between items-center px-4 sm:px-6 h-16">
        {/* LOGO + TITLE */}
        <div className="flex items-center gap-2">
          <img
            src="/acadlyst_logo.png"
            alt="Acadlyst Logo"
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
          <span className="font-bold text-xl sm:text-2xl">Acadlyst</span>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2">
          <NavigationMenuMain />
        </div>

        {/* AUTH BUTTONS */}
        <div className="hidden sm:flex items-center gap-3">
          <ModeToggle />
          <SignedOut>
            <SignInButton />
            <SignUpButton>
              <button className="bg-[#ff0084] text-white rounded-full font-medium text-sm h-10 px-4 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="lg:hidden p-2 rounded-md border border-white/10"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN NAV */}
      {open && (
        <div className="lg:hidden px-4 pb-4 animate-in slide-in-from-top fade-in">
          <NavigationMenuMain />

          {/* AUTH IN MOBILE */}
          <div className="mt-4 flex flex-col gap-3">
            <ModeToggle />
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#ff0084] text-white rounded-full font-medium text-base py-2 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { ModeToggle } from "@/components/mode-toggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Menu } from "lucide-react";

export function FeatureNavbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <div className="fixed top-0 left-0 py-0.5 w-full z-50 bg-background backdrop border-b border-accent/20">
      
      <div className="flex justify-between items-center p-4 gap-4 h-15">
        
        {/* MOBILE HAMBURGER */}
        <button
          type="button"
          aria-label="Open Sidebar"
          title="Open Sidebar"
          className="md:hidden p-2 rounded-md bg-accent/10 border border-accent/20"
          onClick={onOpenSidebar}
        >
          <Menu className="w-6 h-6 text-accent" />
        </button>

        {/* RIGHT SIDE USER CONTROLS */}
        <div className="flex items-center gap-4 ml-auto">
          <ModeToggle />
          <SignedOut>
            <SignInButton />
            <SignUpButton>
              <button className="bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] text-white rounded-full font-medium text-sm h-10 px-4 cursor-pointer hover:opacity-90 transition">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* LOGO LEFT */}
      <div className="hidden md:flex absolute top-0 left-3 mt-1 h-16 items-center justify-center">

        <img src="/acadlyst_logo.png" alt="Acadlyst Logo" className="w-12 h-12 mt-1" />
        <div className="ml-2 font-bold text-2xl">Acadlyst</div>
      </div>
    </div>
  );
}

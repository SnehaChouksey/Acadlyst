"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Workflow from "@/components/ui/workflow";
import DiamondGridComponent from "@/components/ui/DiamondGridBackground";
import { Sparkles } from "lucide-react";
import { useAuth, RedirectToSignIn } from "@clerk/nextjs";

export default function HeroSection() {
  const { isSignedIn } = useAuth();
  const [redirectTarget, setRedirectTarget] = React.useState<string | null>(null);

  const handleProtectedClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetPath: string
  ) => {
    if (!isSignedIn) {
      e.preventDefault();
      setRedirectTarget(targetPath);
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* if user not signed in and clicked a protected button, trigger Clerk redirect */}
      {redirectTarget && <RedirectToSignIn redirectUrl={redirectTarget} />}

      <DiamondGridComponent />

      <div className="relative z-10 flex flex-col items-center justify-start w-full min-h-screen pt-24 px-4 sm:px-6">
        <div className="inline-block mb-4 px-5 py-2 sm:px-6 sm:py-3 rounded-full bg-accent/10 border border-accent/30 backdrop-blur-sm">
          <span className="text-xs sm:text-sm font-medium bg-gradient-primary bg-clip-text text-foreground flex items-center gap-2">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            Your Academic Catalyst
          </span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl pb-2 font-extrabold tracking-tight bg-foreground bg-clip-text text-transparent mb-2 text-center"
        >
          Welcome to Acadlyst
        </motion.h1>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl md:text-6xl pb-2 font-extrabold tracking-tight bg-linear-to-r from-[#ff006f] to-[#ff0088] bg-clip-text text-transparent mb-4 text-center"
        >
          AI Catalyst for Smarter Learning
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-xl text-center text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2 px-2"
        >
          Upload your notes, PDFs, or YouTube lectures and let Acadlyst’s AI
          summarize, explain, and quiz you instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-6"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/quiz"
              onClick={(e) => handleProtectedClick(e, "/quiz")}
              className="inline-block rounded-4xl text-base sm:text-lg px-8 py-2.5 text-white font-semibold bg-linear-to-r from-[#ff5286] to-[#ff0f7f] shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 hover:bg-linear-to-r hover:from-[#ff2e70] hover:to-[#ff007b]"
            >
              Quiz
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/qna/pdf"
              onClick={(e) => handleProtectedClick(e, "/qna/pdf")}
              className="
                inline-block rounded-4xl text-base sm:text-lg px-8 py-2
                border-2 border-accent text-accent font-semibold
                transition-all duration-150
                shadow-[0_0_12px_rgba(244,114,182,0.25)]
                hover:bg-accent hover:text-white hover:shadow-[0_0_18px_rgba(244,114,182,0.45)]
                focus:outline-none focus:ring-2 focus:ring-rose-400
                animate-[borderGlow_2.2s_ease-in-out_infinite]
              "
            >
              Chat
            </Link>
          </motion.div>
        </motion.div>

        <div className="hidden md:block w-full h-[46vh] sm:h-[40vh] mt-0">
          <Workflow />
        </div>
      </div>
    </section>
  );
}

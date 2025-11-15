"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Youtube,
  Text as TextIcon,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth, RedirectToSignIn } from "@clerk/nextjs";

function SubMenuRow({
  label,
  icon: Icon,
  description,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded text-sm bg-accent/10 dark:bg-accent/30 my-1 select-none cursor-default">
      <Icon className="w-4 h-4 text-accent" />
      <div className="font-medium">{label}</div>
      <span className="ml-2 text-xs text-muted-foreground">{description}</span>
    </div>
  );
}

export function NavigationMenuMain() {
  const { isSignedIn } = useAuth();
  const [redirect, setRedirect] = React.useState(false);

  
  const handleProtectedClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isSignedIn) {
      e.preventDefault();
      setRedirect(true);
    }
  };

  return (
    <>
      {redirect && <RedirectToSignIn />}
      <NavigationMenu>
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/" className={navigationMenuTriggerStyle()}>
                Home
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/qna/pdf" onClick={handleProtectedClick}>
              <NavigationMenuTrigger>Chat</NavigationMenuTrigger>
            </Link>
            <NavigationMenuContent>
              <div className="px-4 py-3 min-w-[230px]">
                <div className="font-semibold text-base mb-1">Chat QnA</div>
                <div className="text-xs text-muted-foreground mb-2">
                  Ask and get answers from your notes and PDFs.
                </div>
                <SubMenuRow
                  label="PDF"
                  icon={FileText}
                  description="Chat about your PDF"
                />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/summarizer/pdf" onClick={handleProtectedClick}>
              <NavigationMenuTrigger>Summarizer</NavigationMenuTrigger>
            </Link>
            <NavigationMenuContent>
              <div className="px-4 py-3 min-w-[230px]">
                <div className="font-semibold text-base mb-1">Summarizer</div>
                <div className="text-xs text-muted-foreground mb-2">
                  Summarize your notes in seconds.
                </div>
                <SubMenuRow
                  label="PDF"
                  icon={FileText}
                  description="Summarize your PDF"
                />
                <SubMenuRow
                  label="YouTube Video"
                  icon={Youtube}
                  description="Summarize your video"
                />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/quiz" onClick={handleProtectedClick}>
              <NavigationMenuTrigger>Quiz</NavigationMenuTrigger>
            </Link>
            <NavigationMenuContent>
              <div className="px-4 py-3 min-w-[230px]">
                <div className="font-semibold text-base mb-1">Quiz</div>
                <div className="text-xs text-muted-foreground mb-2">
                  Generate quizzes for practice.
                </div>
                <SubMenuRow
                  label="PDF"
                  icon={FileText}
                  description="Quiz from your PDF"
                />
                <SubMenuRow
                  label="YouTube Video"
                  icon={Youtube}
                  description="Quiz from your video"
                />
                <SubMenuRow
                  label="Text"
                  icon={TextIcon}
                  description="Quiz from your text"
                />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}

export default NavigationMenuMain;

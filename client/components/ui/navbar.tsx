"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Text as TextIcon,
} from "lucide-react";
import { FaYoutube } from "react-icons/fa";
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
    <div
      className="
        flex items-center gap-2 rounded-md border border-transparent
        px-3 py-1.5 my-0.5
        text-xs md:text-sm
        bg-transparent
        hover:bg-accent/10 hover:border-accent/40
        transition-colors cursor-pointer
      "
    >
      <Icon className="w-4 h-4 text-accent" />
      <div className="font-medium">{label}</div>
      <span className="ml-2 text-[11px] text-muted-foreground">
        {description}
      </span>
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
            <Link href="/qna/pdf" onClick={handleProtectedClick}>
              <NavigationMenuTrigger>Chat</NavigationMenuTrigger>
            </Link>
            <NavigationMenuContent>
              <div className="px-4 py-3 min-w-[230px]">
                <div className="font-semibold text-base mb-1">Chat QnA</div>
                <div className="text-xs text-muted-foreground mb-2">
                  Ask and get answers from your notes and PDFs.
                </div>
                <NavigationMenuLink asChild>
                <Link
                href="/qna/pdf"
                onClick={handleProtectedClick}
                className="block"
                >
                <SubMenuRow
                  label="PDF"
                  icon={FileText}
                  description="Chat about your PDF"
                />
                 </Link>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
           </NavigationMenuItem>
          <NavigationMenuItem>
           <Link href="/summarizer/pdf" onClick={handleProtectedClick}>
        <NavigationMenuTrigger>Summarizer</NavigationMenuTrigger>
  </Link>
  <NavigationMenuContent>
    <div className="px-3 py-2 min-w-[230px]">
      <div className="font-semibold text-base mb-1">Summarizer</div>
      <div className="text-xs text-muted-foreground mb-2">
        Summarize your notes in seconds.
      </div>

      <NavigationMenuLink asChild>
        <Link
          href="/summarizer/pdf"
          onClick={handleProtectedClick}
          className="block"
        >
          <SubMenuRow
            label="PDF"
            icon={FileText}
            description="Summarize your PDF"
          />
        </Link>
      </NavigationMenuLink>

      <NavigationMenuLink asChild>
        <Link
          href="/summarizer/pdf"
          onClick={handleProtectedClick}
          className="block"
        >
          <SubMenuRow
            label="YouTube Video"
            icon={FaYoutube}
            description="Summarize your video"
          />
        </Link>
      </NavigationMenuLink>
    </div>
  </NavigationMenuContent>
</NavigationMenuItem>

          <NavigationMenuItem>
         <Link href="/quiz" onClick={handleProtectedClick}>
    <NavigationMenuTrigger>Quiz</NavigationMenuTrigger>
  </Link>
  <NavigationMenuContent>
    <div className="px-3 py-2 min-w-[230px]">
      <div className="font-semibold text-base mb-1">Quiz</div>
      <div className="text-xs text-muted-foreground mb-2">
        Generate quizzes for practice.
      </div>

      <NavigationMenuLink asChild>
        <Link
          href="/quiz"
          onClick={handleProtectedClick}
          className="block"
        >
          <SubMenuRow
            label="PDF"
            icon={FileText}
            description="Quiz from your PDF"
          />
        </Link>
      </NavigationMenuLink>

      <NavigationMenuLink asChild>
        <Link
          href="/quiz"
          onClick={handleProtectedClick}
          className="block"
        >
          <SubMenuRow
            label="YouTube Video"
            icon={FaYoutube}
            description="Quiz from your video"
          />
        </Link>
      </NavigationMenuLink>

      <NavigationMenuLink asChild>
        <Link
          href="/quiz?source=text"
          onClick={handleProtectedClick}
          className="block"
        >
          <SubMenuRow
            label="Text"
            icon={TextIcon}
            description="Quiz from your text"
          />
        </Link>
      </NavigationMenuLink>
    </div>
     </NavigationMenuContent>
     </NavigationMenuItem>

        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}

export default NavigationMenuMain;

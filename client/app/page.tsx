import Link from "next/link";
import { Card } from "@/components/ui/card";
import React from "react";
import DiamondGridBackground from "@/components/ui/DiamondGridBackground";
import Workflow from "@/components/ui/workflow"; 
import HeroSection from "./herosection/page";
import FeatureSection from "@/components/FeatureSection";
import TestimonialsAndFooter from "@/components/TestimonialsAndFooter";
import { Header } from "@/components/header";


export default function Home() {
  return (
    <>
    <Header/>
    <HeroSection />
    <FeatureSection />
    <TestimonialsAndFooter /> 

    
    <div className="fixed inset-0 -z-10 overflow-hidden , w-screen , h-screen">
    <DiamondGridBackground />
    </div>
    
    
    
    
    </>
  );
}

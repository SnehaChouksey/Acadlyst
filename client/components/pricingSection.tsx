"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, MessageSquare, ClipboardList, FileText, Crown } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const freePlanFeatures = [
  { icon: MessageSquare, text: "2 free chats (with 1 PDF upload)" },
  { icon: ClipboardList, text: "2 free quiz generations" },
  { icon: FileText, text: "2 free summarizations" },
];

const premiumPlanFeatures = [
  { icon: MessageSquare, text: "Unlimited chats" },
  { icon: ClipboardList, text: "Unlimited quiz generations" },
  { icon: FileText, text: "Unlimited summaries" },
];

export default function PricingSection() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const handleSubscribe = () => {
    if (!isSignedIn) {
      
      router.push("/sign-in?redirect_url=/pricing");
      return;
    }

    
    router.push("/pricing");
  };

  return (
    <section id="pricing" className="relative py-14 px-6 bg-transparent overflow-hidden">
      
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        
        <div className="text-center mb-10 animate-fade-in">
          <h3 className="text-3xl md:text-5xl font-bold mb-2 pb-2 bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] bg-clip-text text-transparent">
            Plans To Help You Learn Seamlessly
          </h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free, and upgrade to unlock unlimited access to AI-powered learning
          </p>
        </div>

    
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="relative h-full p-8 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 shadow-xl">
    
              <div className="absolute -top-3 left-8">
                <span className="px-4 py-1.5 text-xs font-semibold rounded-full bg-muted text-muted-foreground border border-border">
                  Current Plan
                </span>
              </div>

    
              <div className="mb-8 pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                    <Zap className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground">Free Plan</h4>
                </div>
                <p className="text-muted-foreground mt-2">Perfect to get started</p>
              </div>

        
              <div className="mb-8">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground ml-2">/ month</span>
              </div>

              
              <ul className="space-y-4 mb-8">
                {freePlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <feature.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-foreground/80">{feature.text}</span>
                  </li>
                ))}
              </ul>


              <Button 
                disabled 
                className="w-full h-12 rounded-xl bg-muted text-muted-foreground cursor-not-allowed"
              >
                Current Plan
              </Button>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="relative group"
          >
            
            <div className="absolute -inset-px bg-linear-to-r from-[#E23B6D] via-[#FF7CA3] to-[#E23B6D] rounded-3xl opacity-70 group-hover:opacity-100 transition-opacity blur-sm" />
            <div className="absolute -inset-px bg-linear-to-r from-[#E23B6D] via-[#FF7CA3] to-[#E23B6D] rounded-3xl opacity-70" />
            
            <div className="relative h-full p-8 rounded-3xl bg-card/90 backdrop-blur-xl border border-transparent shadow-2xl">
            
              <div className="absolute -top-3 left-8">
                <span className="px-4 py-1.5 text-xs font-semibold rounded-full bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] text-white shadow-lg">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Most Popular
                </span>
              </div>

        
              <div className="mb-8 pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#E23B6D] to-[#FF7CA3] flex items-center justify-center shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground">Premium Plan</h4>
                </div>
                <p className="text-muted-foreground mt-2">Unlimited access to all features</p>
              </div>

            
              <div className="mb-8">
                <span className="text-4xl font-bold bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] bg-clip-text text-transparent">$2</span>
                <span className="text-muted-foreground ml-2">/ month</span>
              </div>

              
              <ul className="space-y-4 mb-8">
                {premiumPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#E23B6D]/20 to-[#FF7CA3]/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature.text}</span>
                  </li>
                ))}
              </ul>

              
              <Button 
                onClick={handleSubscribe}
                className="w-full h-12 rounded-xl bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] hover:opacity-90 text-white font-semibold shadow-lg transition-all"
              >
                {isSignedIn ? "Subscribe – $2 / month" : "Sign In to Subscribe"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
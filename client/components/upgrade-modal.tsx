'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
}

export default function UpgradeModal({ open, onClose, feature }: UpgradeModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Zap className="h-6 w-6 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            You've run out of {feature} credits. Upgrade to Premium for unlimited access!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-linear-to-br from-pink-50/10 to-pink-50/10 p-6">
            <h3 className="text-3xl font-bold mb-2">
              $5<span className="text-lg font-normal text-muted-foreground">/month</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Everything you need to excel
            </p>
            
            <ul className="space-y-2">
              {["Unlimited PDF Summarization", "Unlimited Quiz Generation", "Unlimited AI Chat", "Priority Support", "No Ads"].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            className="flex-1 sm:flex-none bg-linear-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
          >
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

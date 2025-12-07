"use client";

import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl pb-3 font-bold mb-4 bg-linear-to-r from-[#E23B6D] to-[#FF7CA3] bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground">Choose the plan that fits you the best</p>
        </div>

      
        <PricingTable 
          appearance={{
            variables: {
              colorPrimary: "#E23B6D",
              borderRadius: "0.75rem",
            },
            elements: {
              card: "border-2 border-pink-600 shadow-xl",
              headerTitle: "text-2xl font-bold",
              priceText: "text-4xl font-bold bg-gradient-to-r from-[#E23B6D] to-[#FF7CA3] bg-clip-text text-transparent",
              subscribeButton: "bg-gradient-to-r from-[#E23B6D] to-[#FF7CA3] hover:opacity-90 transition-opacity",
            },
          }}
        />

        <div className="text-center mt-12 text-sm text-muted-foreground space-y-2">
          <p> ✨ Enjoy uninterupted learning</p>
          <p>🔒 Your payment information is completely secured </p>
        </div>
      </div>
    </div>
  );
}

import { PricingTable } from '@clerk/nextjs'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">Choose the plan that's right for you</p>
        </div>

        {/* Clerk's built-in pricing table */}
        <PricingTable />

        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>💳 Test Mode: Use card 4242 4242 4242 4242 for demo</p>
          <p className="mt-2">All subscriptions are for demonstration purposes only</p>
        </div>
      </div>
    </div>
  )
}

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { clerkClient } from '@clerk/clerk-sdk-node';

const prisma = new PrismaClient();

export async function getOrCreateUser(clerkId, email, name, profileImage) {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    // If found, return user
    if (user) return user;

    if (email) {
      const userByEmail = await prisma.user.findUnique({ where: { email } });
      if (userByEmail) {
        // Update existing row to new Clerk ID!
        user = await prisma.user.update({
          where: { email },
          data: {
            clerkId,
            name: name || userByEmail.name,
            profileImage: profileImage || userByEmail.profileImage,
          },
        });
        return user;
      }
    }

    
      const isOwner = process.env.OWNER_EMAIL?.split(",")
        .map(e => e.trim().toLowerCase())
        .includes(email?.toLowerCase());
      
      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          name: name || "User",
          profileImage,
          isOwner,
          plan: isOwner ? "OWNER" : "FREE",
          summarizerCredits: isOwner ? 999999 : 2,
          quizCredits: isOwner ? 999999 : 2,
          chatCredits: isOwner ? 999999 : 1,
          chatMessageCredits: isOwner ? 999999 : 2,
        },
      });
      console.log("✅ New user created:", user.email, "| Owner:", isOwner);
    

    return user;
  } catch (error) {
    console.error("❌ Error creating user:", error);
    throw error;
  }
}

export async function checkCredits(clerkId, feature) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) throw new Error("User not found");

    // 1. Check if user is Premium via Clerk Billing
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const clerkPlanKey = clerkUser.publicMetadata?.plan;
      
      console.log("🔍 Clerk plan key:", clerkPlanKey);
      
      // Check for premium plan key
      if (clerkPlanKey === 'premium') {
        console.log("✅ User is premium via Clerk");
        return { 
          hasCredits: true, 
          remaining: 999999, 
          plan: 'PREMIUM',
          isOwner: false 
        };
      }
      
      // Free plan user - continue to credit checking
      if (clerkPlanKey === 'free_user') {
        console.log("📋 User is on free plan, checking credits");
      }
      
    } catch (clerkError) {
      console.log("⚠️ Clerk API error:", clerkError.message);
      console.log("Falling back to database plan");
    }

    // 2. Owner gets unlimited credits
    if (user.isOwner) {
      return { 
        hasCredits: true, 
        remaining: 999999, 
        isOwner: true, 
        plan: 'OWNER' 
      };
    }
    
    // 3. Check DB plan (manual premium upgrade)
    if (user.plan === "PREMIUM") {
      return { 
        hasCredits: true, 
        remaining: 999999, 
        isOwner: false, 
        plan: "PREMIUM" 
      };
    }
    
    // 4. FREE TIER: Check if credits need reset (monthly on 1st)
    const now = new Date();
    const lastReset = new Date(user.lastCreditResetAt);
    
    if (now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
      await prisma.user.update({
        where: { clerkId },
        data: {
          summarizerCredits: 2,
          quizCredits: 2,
          chatCredits: 1,
          chatMessageCredits: 2,
          lastCreditResetAt: now,
          
        },
      });
      console.log("✅ Credits reset for user:", user.email);
      
      // Refresh user data after reset
      const updatedUser = await prisma.user.findUnique({
        where: { clerkId },
      });
      
      return checkCreditsForFeature(updatedUser, feature);
    }

    // 5. Check feature-specific credits for free users
    return checkCreditsForFeature(user, feature);
    
  } catch (error) {
    console.error("❌ Error checking credits:", error);
    throw error;
  }
}

// Helper function to check credits for a specific feature
function checkCreditsForFeature(user, feature) {
  let creditsField = "";
  
  // Map your backend feature names to credit fields
  switch (feature) {
    case "summarizer":
      creditsField = "summarizerCredits";
      break;
    case "quiz":
      creditsField = "quizCredits";
      break;
    case "chat":
    case "pdf_chatbot":  // Handle both names
      creditsField = "chatCredits";
      break;
    default:
      throw new Error(`Invalid feature: ${feature}`);
  }

  const hasCredits = user[creditsField] > 0;
  
  console.log(`📊 ${feature} credits check:`, {
    feature,
    remaining: user[creditsField],
    hasCredits
  });
  
  return {
    hasCredits,
    remaining: user[creditsField],
    plan: user.plan || 'FREE',
    isOwner: false,
  };
}

export async function deductCredits(clerkId, feature) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) throw new Error("User not found");

    // Check Clerk for premium status before deducting
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const clerkPlanKey = clerkUser.publicMetadata?.plan;
      
      // Premium users don't use credits
      if (clerkPlanKey === 'premium') {
        console.log("✅ Premium user - no deduction");
        return { success: true, remaining: 999999 };
      }
    } catch (clerkError) {
      console.log("⚠️ Clerk API not available for deduction check");
    }

    // Owner and DB Premium don't use credits
    if (user.isOwner || user.plan === "PREMIUM") {
      return { success: true, remaining: 999999 };
    }

    let creditsField = "";
    let counterField = "";

    // Map your backend feature names to credit fields
    switch (feature) {
      case "summarizer":
        creditsField = "summarizerCredits";
        counterField = "totalSummarizes";
        break;
      case "quiz":
        creditsField = "quizCredits";
        counterField = "totalQuizzes";
        break;
      case "chat":
      case "pdf_chatbot":  // Handle both names
        creditsField = "chatCredits";
        counterField = "totalChats";
        break;
      default:
        throw new Error(`Invalid feature: ${feature}`);
    }

    if (user[creditsField] <= 0) {
      throw new Error(`No ${feature} credits remaining`);
    }

    const updated = await prisma.user.update({
      where: { clerkId },
      data: {
        [creditsField]: { decrement: 1 },
        [counterField]: { increment: 1 },
      },
    });

    console.log(`✅ Deducted 1 ${feature} credit. Remaining:`, updated[creditsField]);
    return { success: true, remaining: updated[creditsField] };
    
  } catch (error) {
    console.error("❌ Error deducting credits:", error);
    throw error;
  }
}

export async function getUserStats(clerkId) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) throw new Error("User not found");

    // Check Clerk for current plan status
    let currentPlan = user.plan || 'FREE';
    let isClerkPremium = false;
    
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const clerkPlanKey = clerkUser.publicMetadata?.plan;
      
      if (clerkPlanKey === 'premium') {
        currentPlan = 'PREMIUM';
        isClerkPremium = true;
      } else if (clerkPlanKey === 'free_user') {
        currentPlan = 'FREE';
      }
    } catch (clerkError) {
      console.log("⚠️ Clerk API not available for stats");
    }

    const isPremium = isClerkPremium || currentPlan === 'PREMIUM' || user.isOwner;

    return {
      email: user.email,
      name: user.name,
      isOwner: user.isOwner,
      plan: currentPlan,
      credits: {
        summarizer: isPremium ? 999999 : user.summarizerCredits,
        quiz: isPremium ? 999999 : user.quizCredits,
        chat: isPremium ? 999999 : user.chatCredits,
        chatMessages: isPremium ? 999999 : user.chatMessageCredits,
      },
      usage: {
        totalSummarizes: user.totalSummarizes,
        totalQuizzes: user.totalQuizzes,
        totalChats: user.totalChats,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    throw error;
  }
}
// ADD THESE TWO NEW FUNCTIONS AT THE END

export async function checkChatMessageCredits(clerkId) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) throw new Error("User not found");

    // Check Clerk for premium status
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const clerkPlanKey = clerkUser.publicMetadata?.plan;
      
      if (clerkPlanKey === 'premium') {
        console.log("✅ Premium user - unlimited chat messages");
        return { hasCredits: true, remaining: 999999, plan: 'PREMIUM' };
      }
    } catch (clerkError) {
      console.log("⚠️ Clerk API not available for chat message check");
    }

    // Owner gets unlimited
    if (user.isOwner || user.plan === "PREMIUM") {
      return { hasCredits: true, remaining: 999999, plan: user.plan };
    }

    // Check chat message credits for free users
    const hasCredits = user.chatMessageCredits > 0;
    
    console.log(`📊 Chat message credits check:`, {
      remaining: user.chatMessageCredits,
      hasCredits
    });
    
    return {
      hasCredits,
      remaining: user.chatMessageCredits,
      plan: user.plan || 'FREE',
    };
  } catch (error) {
    console.error("❌ Error checking chat message credits:", error);
    throw error;
  }
}

export async function deductChatMessageCredits(clerkId) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) throw new Error("User not found");

    // Check Clerk for premium status
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const clerkPlanKey = clerkUser.publicMetadata?.plan;
      
      if (clerkPlanKey === 'premium') {
        console.log("✅ Premium user - no chat message deduction");
        return { success: true, remaining: 999999 };
      }
    } catch (clerkError) {
      console.log("⚠️ Clerk API not available for deduction");
    }

    // Premium/Owner don't use credits
    if (user.isOwner || user.plan === "PREMIUM") {
      return { success: true, remaining: 999999 };
    }

    if (user.chatMessageCredits <= 0) {
      throw new Error("No chat message credits remaining");
    }

    const updated = await prisma.user.update({
      where: { clerkId },
      data: {
        chatMessageCredits: { decrement: 1 },
        totalChats: { increment: 1 },
      },
    });

    console.log(`✅ Deducted 1 chat message credit. Remaining:`, updated.chatMessageCredits);
    return { success: true, remaining: updated.chatMessageCredits };
  } catch (error) {
    console.error("❌ Error deducting chat message credits:", error);
    throw error;
  }
}



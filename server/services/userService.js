import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getOrCreateUser(clerkId, email, name, profileImage) {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      const isOwner = process.env.OWNER_EMAIL?.split(",").map(e => e.trim().toLowerCase()).includes(email.toLowerCase());
      
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
        },
      });
      console.log("✅ New user created:", user.email, "| Owner:", isOwner);
    }

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

    // Owner gets unlimited credits
    if (user.isOwner) {
      return { hasCredits: true, remaining: 999999, isOwner: true };
    }

    // Check if credits need reset (monthly on 1st)
    const now = new Date();
    const lastReset = new Date(user.lastCreditResetAt);
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await prisma.user.update({
        where: { clerkId },
        data: {
          summarizerCredits: 2,
          quizCredits: 2,
          chatCredits: 1,
          lastCreditResetAt: now,
        },
      });
      console.log("✅ Credits reset for user:", user.email);
    }

    let creditsField = "";
    switch (feature) {
      case "summarizer":
        creditsField = "summarizerCredits";
        break;
      case "quiz":
        creditsField = "quizCredits";
        break;
      case "chat":
        creditsField = "chatCredits";
        break;
      default:
        throw new Error("Invalid feature");
    }

    const hasCredits = user[creditsField] > 0;
    return {
      hasCredits,
      remaining: user[creditsField],
      plan: user.plan,
      isOwner: false,
    };
  } catch (error) {
    console.error("❌ Error checking credits:", error);
    throw error;
  }
}

export async function deductCredits(clerkId, feature) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) throw new Error("User not found");

    // Owner doesn't use credits
    if (user.isOwner) {
      return { success: true, remaining: 999999 };
    }

    let creditsField = "";
    let counterField = "";

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
        creditsField = "chatCredits";
        counterField = "totalChats";
        break;
      default:
        throw new Error("Invalid feature");
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

    console.log(`✅ Deducted 1 credit from ${feature}. Remaining:`, updated[creditsField]);
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

    return {
      email: user.email,
      name: user.name,
      isOwner: user.isOwner,
      plan: user.plan,
      credits: {
        summarizer: user.summarizerCredits,
        quiz: user.quizCredits,
        chat: user.chatCredits,
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

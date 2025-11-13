-- CreateTable
CREATE TABLE "ChatHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sources" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatHistory_userId_createdAt_idx" ON "ChatHistory"("userId", "createdAt");

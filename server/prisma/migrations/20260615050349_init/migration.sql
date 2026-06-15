-- CreateEnum
CREATE TYPE "Cycle" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "AppCategory" AS ENUM ('SOCIAL', 'SHORTVIDEO', 'OTHER');

-- CreateEnum
CREATE TYPE "RuleScope" AS ENUM ('APP', 'CATEGORY', 'TOTAL');

-- CreateEnum
CREATE TYPE "ProposalKind" AS ENUM ('CHANGE_CAP', 'CHANGE_PENALTY');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('OPEN', 'PASSED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('YESTERDAY', 'TODAY');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'PARSED', 'NEED_REUPLOAD');

-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('USER', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "lineUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cycle" "Cycle" NOT NULL DEFAULT 'DAILY',
    "reportDeadline" TEXT NOT NULL DEFAULT '23:00',
    "ownerId" TEXT NOT NULL,
    "joinToken" TEXT,
    "joinTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomMember" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppCatalog" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AppCategory" NOT NULL,
    "glyph" TEXT,
    "color" TEXT,

    CONSTRAINT "AppCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackedApp" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "dailyCapMin" INTEGER,

    CONSTRAINT "TrackedApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "scope" "RuleScope" NOT NULL,
    "appId" TEXT,
    "category" "AppCategory",
    "capMin" INTEGER NOT NULL,
    "penaltyText" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "kind" "ProposalKind" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'OPEN',
    "closesAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalOption" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "ProposalOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "roomId" TEXT,
    "userId" TEXT NOT NULL,
    "forDate" TIMESTAMP(3) NOT NULL,
    "kind" "SubmissionKind" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "imagePath" TEXT NOT NULL,
    "totalMin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractedUsage" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "appKey" TEXT,
    "appLabel" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,

    CONSTRAINT "ExtractedUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementResult" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalMin" INTEGER NOT NULL,
    "capMin" INTEGER NOT NULL,
    "overMin" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL,
    "penaltyText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT,
    "kind" "MessageKind" NOT NULL DEFAULT 'USER',
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_lineUserId_key" ON "User"("lineUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_joinToken_key" ON "Room"("joinToken");

-- CreateIndex
CREATE UNIQUE INDEX "RoomMember_roomId_userId_key" ON "RoomMember"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AppCatalog_key_key" ON "AppCatalog"("key");

-- CreateIndex
CREATE UNIQUE INDEX "TrackedApp_roomId_appId_key" ON "TrackedApp"("roomId", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_proposalId_userId_key" ON "Vote"("proposalId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SettlementResult_roomId_userId_periodStart_key" ON "SettlementResult"("roomId", "userId", "periodStart");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMember" ADD CONSTRAINT "RoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMember" ADD CONSTRAINT "RoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackedApp" ADD CONSTRAINT "TrackedApp_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackedApp" ADD CONSTRAINT "TrackedApp_appId_fkey" FOREIGN KEY ("appId") REFERENCES "AppCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalOption" ADD CONSTRAINT "ProposalOption_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ProposalOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedUsage" ADD CONSTRAINT "ExtractedUsage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementResult" ADD CONSTRAINT "SettlementResult_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementResult" ADD CONSTRAINT "SettlementResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

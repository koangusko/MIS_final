-- Proposal：提議內容（新上限 / 新懲罰）
ALTER TABLE "Proposal" ADD COLUMN "newCapMin" INTEGER;
ALTER TABLE "Proposal" ADD COLUMN "newPenaltyText" TEXT;

-- Vote：改為贊成/反對；optionId 改為可空（保留給多選提案）
ALTER TABLE "Vote" ADD COLUMN "approve" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Vote" ALTER COLUMN "optionId" DROP NOT NULL;

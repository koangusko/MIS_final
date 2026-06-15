-- Room：總上限、懲罰文字、最近結算期別
ALTER TABLE "Room" ADD COLUMN "totalCapMin" INTEGER;
ALTER TABLE "Room" ADD COLUMN "penaltyText" TEXT;
ALTER TABLE "Room" ADD COLUMN "lastSettledPeriod" TEXT;

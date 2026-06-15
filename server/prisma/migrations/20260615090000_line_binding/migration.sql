-- User：LINE 綁定碼
ALTER TABLE "User" ADD COLUMN "lineBindingCode" TEXT;
CREATE UNIQUE INDEX "User_lineBindingCode_key" ON "User"("lineBindingCode");

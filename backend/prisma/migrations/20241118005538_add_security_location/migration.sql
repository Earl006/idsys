/*
  Warnings:

  - A unique constraint covering the columns `[securityId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "securityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Location_securityId_key" ON "Location"("securityId");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_securityId_fkey" FOREIGN KEY ("securityId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

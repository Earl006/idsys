-- DropForeignKey
ALTER TABLE "AccessLog" DROP CONSTRAINT "AccessLog_personId_fkey";

-- AlterTable
ALTER TABLE "AccessLog" ALTER COLUMN "personId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

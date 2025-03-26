-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "isOfficial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTeam" BOOLEAN NOT NULL DEFAULT false;

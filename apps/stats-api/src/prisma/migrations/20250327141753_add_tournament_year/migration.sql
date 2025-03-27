/*
  Warnings:

  - Added the required column `year` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "playedAt" SET DEFAULT (date_trunc('year', CURRENT_DATE))::timestamp;

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "playedAt" SET DEFAULT (date_trunc('year', CURRENT_DATE))::timestamp;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN "year" INTEGER;
UPDATE "Tournament" SET "year" = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
ALTER TABLE "Tournament" ALTER COLUMN "year" SET NOT NULL;

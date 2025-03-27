-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "playedAt" SET DEFAULT (date_trunc('year', CURRENT_DATE))::timestamp;

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "playedAt" SET DEFAULT (date_trunc('year', CURRENT_DATE))::timestamp;

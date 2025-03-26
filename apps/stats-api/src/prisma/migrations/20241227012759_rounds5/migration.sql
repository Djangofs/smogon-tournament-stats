/*
  Warnings:

  - You are about to drop the column `tournamentId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `replayUrl` on the `Player_Game` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_tournamentId_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "replayUrl" TEXT;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "tournamentId";

-- AlterTable
ALTER TABLE "Player_Game" DROP COLUMN "replayUrl";

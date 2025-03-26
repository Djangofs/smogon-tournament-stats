/*
  Warnings:

  - You are about to drop the column `date` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `replayUrl` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `Player_Match` table. All the data in the column will be lost.
  - You are about to drop the column `bestOf` on the `Round` table. All the data in the column will be lost.
  - You are about to drop the `Player_Round` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bestOf` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tournament_teamId` to the `Player_Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Round` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Player_Match" DROP CONSTRAINT "Player_Match_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Player_Round" DROP CONSTRAINT "Player_Round_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Player_Round" DROP CONSTRAINT "Player_Round_roundId_fkey";

-- DropForeignKey
ALTER TABLE "Player_Round" DROP CONSTRAINT "Player_Round_teamId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "date",
DROP COLUMN "replayUrl",
ADD COLUMN     "bestOf" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Player_Match" DROP COLUMN "teamId",
ADD COLUMN     "tournament_teamId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Round" DROP COLUMN "bestOf",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "Player_Round";

-- CreateTable
CREATE TABLE "Game" (
    "id" UUID NOT NULL,
    "matchId" UUID NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player_Game" (
    "playerId" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "winner" BOOLEAN NOT NULL,
    "replayUrl" TEXT,

    CONSTRAINT "Player_Game_pkey" PRIMARY KEY ("playerId","gameId")
);

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player_Match" ADD CONSTRAINT "Player_Match_tournament_teamId_fkey" FOREIGN KEY ("tournament_teamId") REFERENCES "Tournament_Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player_Game" ADD CONSTRAINT "Player_Game_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player_Game" ADD CONSTRAINT "Player_Game_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

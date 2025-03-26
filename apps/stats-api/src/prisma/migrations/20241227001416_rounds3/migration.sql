/*
  Warnings:

  - You are about to drop the `_PlayerToTournament_Team` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PlayerToTournament_Team" DROP CONSTRAINT "_PlayerToTournament_Team_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlayerToTournament_Team" DROP CONSTRAINT "_PlayerToTournament_Team_B_fkey";

-- DropTable
DROP TABLE "_PlayerToTournament_Team";

-- CreateTable
CREATE TABLE "Tournament_Player" (
    "playerId" UUID NOT NULL,
    "id" UUID NOT NULL,
    "tournament_teamId" UUID NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "Tournament_Player_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tournament_Player" ADD CONSTRAINT "Tournament_Player_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament_Player" ADD CONSTRAINT "Tournament_Player_tournament_teamId_fkey" FOREIGN KEY ("tournament_teamId") REFERENCES "Tournament_Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

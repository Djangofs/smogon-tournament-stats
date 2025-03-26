/*
  Warnings:

  - You are about to drop the `_PlayerToTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TeamToTournament` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bestOf` to the `Round` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_PlayerToTeam" DROP CONSTRAINT "_PlayerToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlayerToTeam" DROP CONSTRAINT "_PlayerToTeam_B_fkey";

-- DropForeignKey
ALTER TABLE "_TeamToTournament" DROP CONSTRAINT "_TeamToTournament_A_fkey";

-- DropForeignKey
ALTER TABLE "_TeamToTournament" DROP CONSTRAINT "_TeamToTournament_B_fkey";

-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "bestOf" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_PlayerToTeam";

-- DropTable
DROP TABLE "_TeamToTournament";

-- CreateTable
CREATE TABLE "Tournament_Team" (
    "tournamentId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "id" UUID NOT NULL,

    CONSTRAINT "Tournament_Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player_Round" (
    "playerId" UUID NOT NULL,
    "roundId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "winner" BOOLEAN NOT NULL,

    CONSTRAINT "Player_Round_pkey" PRIMARY KEY ("playerId","roundId")
);

-- CreateTable
CREATE TABLE "_PlayerToTournament_Team" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_PlayerToTournament_Team_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PlayerToTournament_Team_B_index" ON "_PlayerToTournament_Team"("B");

-- AddForeignKey
ALTER TABLE "Tournament_Team" ADD CONSTRAINT "Tournament_Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament_Team" ADD CONSTRAINT "Tournament_Team_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player_Round" ADD CONSTRAINT "Player_Round_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player_Round" ADD CONSTRAINT "Player_Round_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player_Round" ADD CONSTRAINT "Player_Round_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToTournament_Team" ADD CONSTRAINT "_PlayerToTournament_Team_A_fkey" FOREIGN KEY ("A") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToTournament_Team" ADD CONSTRAINT "_PlayerToTournament_Team_B_fkey" FOREIGN KEY ("B") REFERENCES "Tournament_Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

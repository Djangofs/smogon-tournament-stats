/*
  Warnings:

  - You are about to drop the column `team` on the `Player_Match` table. All the data in the column will be lost.
  - Added the required column `teamId` to the `Player_Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player_Match" DROP COLUMN "team",
ADD COLUMN     "teamId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Player_Match" ADD CONSTRAINT "Player_Match_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

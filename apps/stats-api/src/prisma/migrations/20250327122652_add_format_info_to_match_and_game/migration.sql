/*
  Warnings:

  - Added the required column `generation` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tier` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generation` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tier` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- First add the columns with default values
ALTER TABLE "Game" ADD COLUMN "generation" TEXT NOT NULL DEFAULT 'SV';
ALTER TABLE "Game" ADD COLUMN "tier" TEXT NOT NULL DEFAULT 'OU';

-- Then remove the default values
ALTER TABLE "Game" ALTER COLUMN "generation" DROP DEFAULT;
ALTER TABLE "Game" ALTER COLUMN "tier" DROP DEFAULT;

-- First add the columns with default values
ALTER TABLE "Match" ADD COLUMN "generation" TEXT NOT NULL DEFAULT 'SV';
ALTER TABLE "Match" ADD COLUMN "tier" TEXT NOT NULL DEFAULT 'OU';

-- Then remove the default values
ALTER TABLE "Match" ALTER COLUMN "generation" DROP DEFAULT;
ALTER TABLE "Match" ALTER COLUMN "tier" DROP DEFAULT;

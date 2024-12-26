/*
  Warnings:

  - You are about to drop the `Tournaments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Tournaments";

-- CreateTable
CREATE TABLE "Tournament" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

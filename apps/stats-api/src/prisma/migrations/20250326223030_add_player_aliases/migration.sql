-- CreateTable
CREATE TABLE "PlayerAlias" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerAlias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerAlias_playerId_idx" ON "PlayerAlias"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAlias_name_key" ON "PlayerAlias"("name");

-- AddForeignKey
ALTER TABLE "PlayerAlias" ADD CONSTRAINT "PlayerAlias_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

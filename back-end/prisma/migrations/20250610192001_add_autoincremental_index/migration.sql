-- AlterTable
ALTER TABLE "riddles" ADD COLUMN     "index" SERIAL NOT NULL;

-- CreateIndex
CREATE INDEX "riddles_index_idx" ON "riddles"("index");

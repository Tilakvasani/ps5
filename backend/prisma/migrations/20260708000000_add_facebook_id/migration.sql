-- AlterTable
ALTER TABLE "users" ADD COLUMN "facebook_id" VARCHAR(120);

-- CreateIndex
CREATE UNIQUE INDEX "users_facebook_id_key" ON "users"("facebook_id");

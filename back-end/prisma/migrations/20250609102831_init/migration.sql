-- CreateEnum
CREATE TYPE "ESeederStatus" AS ENUM ('pending', 'success', 'error');

-- CreateEnum
CREATE TYPE "ERuleName" AS ENUM ('submit_riddle_answer');

-- CreateEnum
CREATE TYPE "ERoleName" AS ENUM ('restricted', 'signed');

-- CreateTable
CREATE TABLE "seeders" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ESeederStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "seeders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "role_id" UUID NOT NULL,
    "challenge_id" UUID,
    "login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" UUID NOT NULL,
    "nonce" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" "ERoleName" NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" UUID NOT NULL,
    "name" "ERuleName" NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToRule" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_RoleToRule_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "seeders_id_key" ON "seeders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "seeders_name_key" ON "seeders"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_address_key" ON "users"("address");

-- CreateIndex
CREATE UNIQUE INDEX "users_challenge_id_key" ON "users"("challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "challenges_id_key" ON "challenges"("id");

-- CreateIndex
CREATE UNIQUE INDEX "challenges_user_id_key" ON "challenges"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_id_key" ON "roles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rules_id_key" ON "rules"("id");

-- CreateIndex
CREATE UNIQUE INDEX "rules_name_key" ON "rules"("name");

-- CreateIndex
CREATE INDEX "_RoleToRule_B_index" ON "_RoleToRule"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToRule" ADD CONSTRAINT "_RoleToRule_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToRule" ADD CONSTRAINT "_RoleToRule_B_fkey" FOREIGN KEY ("B") REFERENCES "rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ARTIST', 'CLIENT');

-- CreateEnum
CREATE TYPE "TattooType_new" AS ENUM ('DRAWING', 'TEXT', 'CLOSURE');

-- Migrate TattooType enum to include CLOSURE
ALTER TYPE "TattooType" ADD VALUE 'CLOSURE';

-- AlterTable - Add role column to users
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'ARTIST';

-- AlterTable - Add userId column to clients
ALTER TABLE "clients" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clients_userId_key" ON "clients"("userId");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop unused enum
DROP TYPE "TattooType_new";

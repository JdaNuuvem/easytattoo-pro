-- Add missing columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "maxCompanions" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "paymentMethods" TEXT[] DEFAULT ARRAY['PIX']::TEXT[];
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "googleId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "googleAccessToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "googleRefreshToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "googleCalendarId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "evolutionApiUrl" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "evolutionApiKey" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "evolutionInstanceName" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "smtpHost" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "smtpPort" INTEGER;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "smtpUser" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "smtpPass" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "smtpFrom" TEXT;

-- Make password nullable (for Google OAuth users)
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- Add unique index on googleId
CREATE UNIQUE INDEX IF NOT EXISTS "users_googleId_key" ON "users"("googleId");

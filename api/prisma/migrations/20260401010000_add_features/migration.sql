-- Password reset fields
ALTER TABLE "users" ADD COLUMN "resetPasswordToken" TEXT;
ALTER TABLE "users" ADD COLUMN "resetPasswordExpires" TIMESTAMP(3);

-- Consent fields on bookings
ALTER TABLE "bookings" ADD COLUMN "consentAccepted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "bookings" ADD COLUMN "consentAcceptedAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN "consentIp" TEXT;

-- Studio members (many-to-many)
CREATE TABLE "studio_members" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "studio_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "studio_members_studioId_userId_key" ON "studio_members"("studioId", "userId");
ALTER TABLE "studio_members" ADD CONSTRAINT "studio_members_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "studio_members" ADD CONSTRAINT "studio_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

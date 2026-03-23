#!/bin/sh

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma || echo "WARNING: Migrations failed, starting anyway..."

echo "Starting EasyTattoo API..."
exec node dist/src/main

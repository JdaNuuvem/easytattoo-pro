#!/bin/sh
set -e

echo "Running Prisma migrations..."
prisma migrate deploy --schema=./prisma/schema.prisma

echo "Starting EasyTattoo API..."
exec node dist/main

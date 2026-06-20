# AutoBat Digital Operations Platform

Mobile-first platform for AutoBat dealers, distributors, delivery staff, and
company teams. The first release focuses on battery traceability and warranty
management from factory dispatch through customer sale and claim settlement.

## Applications

- `apps/mobile`: Expo React Native app with role-based dealer, distributor, and
  delivery experiences.
- `apps/admin`: Next.js web portal for AutoBat operations and management.
- `apps/api`: NestJS API and background jobs.
- `packages/contracts`: Shared TypeScript domain types and validation schemas.

## Documentation

- `docs/01-project-plan.md`: Agreed product scope and phased delivery plan.
- `docs/02-system-design.md`: End-to-end system design.
- `docs/03-app-screens-and-flows.md`: Mobile and admin screen inventory.
- `resources/RESOURCE_CHECKLIST.md`: Material to collect from AutoBat.
- `resources/SOURCES.md`: Public research sources and validation notes.

## Proposed Stack

- TypeScript throughout the monorepo
- Expo + React Native + Expo Router for Android/iOS
- Next.js for the admin portal
- NestJS for REST APIs and background processing
- PostgreSQL + Prisma
- Redis + BullMQ for notifications, imports, and asynchronous jobs
- S3-compatible object storage for invoices, claim evidence, and certificates
- pnpm workspaces + Turborepo
- Jest/Vitest, React Native Testing Library, Supertest, and Maestro

This stack uses common conventions, strong typing, and shared contracts, making
the codebase predictable for developers and AI coding tools.

## Status

The repository is currently a planning and scaffold baseline. Dependencies have
not been installed and no production behavior is implemented yet.


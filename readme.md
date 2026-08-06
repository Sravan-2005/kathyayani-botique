# Kathyayani Boutique database example

This project uses PostgreSQL with Drizzle ORM.

## Setup

1. Install dependencies with `npm install`.
2. Create a `.env` file containing `DATABASE_URL=postgresql://user:password@host:5432/database`.
3. Apply migrations with `npm run db:migrate`.
4. Run the example with `npm start`.

## Commands

- `npm run typecheck` checks the TypeScript code.
- `npm run db:generate` generates migrations from the schema.
- `npm run db:migrate` applies generated migrations.
- `npm run db:push` pushes the schema directly to the database.
- `npm run db:pull` introspects the existing database.

If PowerShell blocks npm scripts, use `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` in a PowerShell window you trust.

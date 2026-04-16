---
description: Use Bun instead of Node.js, npm, pnpm, or vite. Plus project-specific guidelines for the Table Availability Service.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Table Availability Service Architecture

This service follows a layered architecture pattern:

- **Presentation Layer**: REST API endpoints defined in `src/routes.ts`
- **Service Layer**: Business logic in `src/services/availability.ts`
- **Data Access Layer**: Database operations in `src/model/TableRepository.ts`
- **Database Layer**: PostgreSQL with Drizzle ORM

## Core Development Principles

### Think Before Coding
Before implementing any feature:
1. Understand the existing architecture and patterns
2. Identify where your changes fit in the layered structure
3. Consider the impact on existing functionality
4. Plan your approach using the established patterns

### Simplicity First
- Follow existing code patterns and conventions
- Keep functions focused on a single responsibility
- Use clear, descriptive naming
- Avoid premature optimization

### Surgical Changes
- Make minimal, targeted changes to fix issues or add features
- Preserve existing functionality unless intentionally refactoring
- Test your changes in isolation before integrating
- Document breaking changes or major modifications

### Goal-Driven Execution
- Focus on user-facing outcomes rather than technical indulgences
- Measure success by working features, not lines of code
- Prioritize stability and maintainability over clever solutions

## Project Structure

```
src/
├── db/                 # Database configuration and operations
│   ├── index.ts        # Database connection
│   ├── schema.ts       # Database schema definitions
│   ├── migrate.ts      # Migration runner
│   └── seed.ts         # Data seeding
├── helpers/            # Utility functions
│   ├── error.ts        # Custom error classes
│   └── responses.ts    # Response formatting helpers
├── model/              # Data models and repositories
│   └── TableRepository.ts
├── services/           # Business logic
│   └── availability.ts
├── types/              # TypeScript type definitions
│   └── model.ts
├── routes.ts           # API route definitions
└── server.ts           # Server entry point
```

## API Endpoints

### GET /tables
Retrieve all tables with their availability status

### GET /tables/:tableId
Retrieve a specific table by ID

### PUT /tables
Update table availability status
Body: `{ tableId: string, available: boolean }`

## Data Model

```typescript
type Table = {
    tableId: string;     // Primary key
    capacity: number;    // Number of seats
    location: string;    // Descriptive location
    available: boolean;  // Current availability status
}
```

## Error Handling

The service uses custom error classes:
- `NotFoundError`: For missing resources (HTTP 404)
- `ValidationError`: For invalid request data (HTTP 400)

Responses follow a consistent format:
- Success: `{ success: true, data: T, error: null }`
- Failure: `{ success: false, data: null, error: string }`

## Development Workflow

### Starting the Service
```bash
# Development mode with hot reloading
bun run dev

# Production build
bun run build
bun run start
```

### Database Operations
```bash
# Generate migrations (after schema changes)
bun run db:generate

# Apply migrations
bun run db:migrate

# Seed initial data
bun run db:seed

# Full setup (migrate + seed)
bun run setup
```

## Testing Guidelines

Use `bun test` for running tests. Create test files alongside the modules they test with `.test.ts` extension.

Example test pattern:
```typescript
import { test, expect } from "bun:test";
import { AvailabilityService } from "../src/services/availability";

test("should get all tables", async () => {
  const service = AvailabilityService.getInstance();
  const tables = await service.getTables();
  expect(tables).toBeInstanceOf(Array);
});
```

## Best Practices

1. **Dependency Injection**: Use singleton pattern for services and repositories
2. **Environment Variables**: Access via `process.env` (Bun loads .env automatically)
3. **Type Safety**: Leverage TypeScript for compile-time safety
4. **Error Handling**: Always wrap async operations in try/catch blocks
5. **Response Formatting**: Use the provided `ok()` and `fail()` helpers
6. **Database Operations**: Use Drizzle ORM methods consistently
7. **Logging**: Use `console.error()` for error logging in catch blocks
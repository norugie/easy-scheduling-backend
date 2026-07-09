# easy-scheduling-backend

Node, Express, TypeScript, Drizzle, and PostgreSQL scheduling API.

## Environment

- `PORT=3000`
- `DATABASE_URL=postgres://postgres:postgres@localhost:5432/easy_scheduling`
- `CORS_ORIGIN=http://localhost:5173`
- `DB_POOL_MAX=10`
- `DB_IDLE_TIMEOUT_MS=30000`
- `DB_CONNECTION_TIMEOUT_MS=2000`
- `NODE_ENV=development`
- `JWT_ACCESS_SECRET=replace-with-at-least-32-random-characters`
- `ACCESS_TOKEN_TTL_MINUTES=15`
- `REFRESH_TOKEN_TTL_DAYS=7`
- `REFRESH_COOKIE_NAME=easy_scheduling_refresh`

Auth uses user records, password hashes, short-lived JWT access tokens, and
HTTP-only refresh-token cookies backed by the `refresh_tokens` table. Do not
commit real JWT secrets.

Calendar scheduling values are stored and returned as date-only `YYYY-MM-DD`
values. Audit/auth timestamps are PostgreSQL timestamp-with-time-zone values,
stored as UTC instants and displayed by the frontend in the viewer's local
timezone.

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm typecheck`
- `pnpm self-check`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:seed`

Run migrations after setting `DATABASE_URL`:

```sh
pnpm db:migrate
```

Seed the first user after migrations:

```sh
pnpm db:seed
```

Seeded login:

- Username: `hr.anderson`
- Password: `password`

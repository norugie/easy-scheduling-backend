# Backend Agent Notes

- Use the existing Express route/controller/service split.
- Keep controllers thin; put database behavior in services.
- Validate bodies, params, and queries with Zod before controllers.
- Return `{ success: true, data }` and `{ success: false, error }`.
- Store scheduling dates as `YYYY-MM-DD` date-only strings.
- Store auth/audit timestamps as UTC instants.
- Auth is JWT access tokens plus HTTP-only refresh-token cookies.
- Run `pnpm db:seed` after migrations when bootstrapping a local database.
- Run `pnpm typecheck`, `pnpm self-check`, and `pnpm build` before handoff.

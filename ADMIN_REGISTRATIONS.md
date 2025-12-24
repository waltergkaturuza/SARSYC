# Admin Registrations — Implementation Notes

This documents the new Admin Registrations list, bulk actions, and export endpoint implemented for SARSYC platform.

## Features
- Server-side Registrations list (paginated) at `/(admin)/registrations` (server component)
- Client `RegistrationsTable` component with selection, bulk actions (Mark Confirmed / Send Email / Soft Delete) and Export CSV
- Export endpoint: `GET /api/admin/registrations/export`
  - Requires `x-admin-user-id` header for authorization (temporary; integrate with real session auth in production)
  - Rate-limited (3 exports per 10 minutes per admin)
  - Streams CSV directly to browser (UTF-8, snake_case headers, ISO dates)
  - Logs audit record to `payload_kv` via `logExport` and increments export counter
- Bulk actions endpoint: `POST /api/admin/registrations/bulk`
  - `action` and `ids` in body
  - Supported actions: `markConfirmed`, `sendEmail`, `softDelete`

## Development notes
- For local dev or initial testing, set `ADMIN_USER_ID` to an admin user's ID in your environment.
- Export and bulk endpoints use `x-admin-user-id` header for authorization; replace with session-based checks in production.

## Tests
- Basic existence tests added: `tests/export.spec.mjs`, `tests/bulk.spec.mjs`
- Run `npm test` to execute them locally.

## Next steps
- Add robust session-based auth and CSRF protection for admin endpoints.
- Add `deletedAt` column/migration to `registrations` for fully-featured soft-delete behavior.
- Add more integration/e2e tests (Playwright) to validate export contents and CSV encoding.

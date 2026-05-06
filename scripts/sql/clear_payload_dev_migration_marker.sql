-- Removes Payload/Drizzle "dev push" rows (batch = -1) that trigger an interactive migrate warning:
-- "It looks like you've run Payload in dev mode..."
-- Run once on production Postgres if those rows exist from pointing local dev at prod DB or similar.
-- Safe to run when no migrations are genuinely in-flight; omit if unsure and rely on scripted stdin confirm instead.

DELETE FROM payload_migrations WHERE batch = -1;

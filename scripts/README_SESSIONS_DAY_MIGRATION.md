# Sessions `day` column migration

## Error fixed

If you see:

```text
column sessions.day does not exist
```

the `sessions` table is missing the `day` column that was added to the Sessions collection for Day 1–4 (including Day 4 Orathon).

## What to do

Run the migration SQL on your database (e.g. Neon):

1. In **Neon**: open your project → **SQL Editor**.
2. Paste the contents of `scripts/add_sessions_day_column.sql`.
3. Run the script.

Or via `psql`:

```bash
psql "YOUR_DATABASE_URL" -f scripts/add_sessions_day_column.sql
```

The script is safe to run more than once (it only adds the column if it does not exist).

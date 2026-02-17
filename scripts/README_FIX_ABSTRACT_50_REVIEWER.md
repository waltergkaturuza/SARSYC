# Fix: Assign abstract 50 to reviewer 3 (Neon UI)

The error **"This relationship field has the following invalid relationships: 3 0"** means the `abstracts_rels` table has rows with `users_id = 0` (invalid). This script cleans those and assigns abstract 50 to reviewer 3 (waltergkaturuza@gmail.com, id = 3 in users).

## Steps in Neon

1. **Open Neon Console**  
   Go to [console.neon.tech](https://console.neon.tech) → your project.

2. **Open SQL Editor**  
   In the left sidebar, click **SQL Editor**.

3. **Confirm IDs (optional)**  
   Run these to confirm abstract 50 and reviewer 3 exist:
   ```sql
   SELECT id, title FROM abstracts WHERE id = 50;
   SELECT id, email FROM users WHERE id = 3;
   ```
   Reviewer 3 = waltergkaturuza@gmail.com. If you need a different reviewer, replace `3` in the script with that user’s `id`.

4. **Run the fix script (important)**  
   - Open **`scripts/fix_abstract_50_assign_reviewer_3_run_in_neon.sql`** (this one does DELETE + INSERT in one go).  
   - Copy its **entire** contents, paste into the Neon SQL Editor.  
   - **Run the whole script** (e.g. “Run” so all statements execute), not just the verification SELECTs.  
   - If you only run the last SELECT, no assignment is written and “My Assigned Abstracts” will stay empty.

5. **Verify**  
   Run:
   ```sql
   SELECT ar.parent_id, ar.path, ar.users_id, u.email
   FROM abstracts_rels ar
   LEFT JOIN users u ON u.id = ar.users_id
   WHERE ar.parent_id = 50 AND ar.path = 'assignedReviewers';
   ```
   You should see one row with `users_id = 3` and `u.email = waltergkaturuza@gmail.com`.

After that, **log out and log back in** as the reviewer (or refresh the “My Assigned Abstracts” page); abstract 50 should appear. The invalid "0" error should be gone.

**If the verification SELECT still returns no row:**  
- Ensure you ran the **full** script (including the DELETE and INSERT), not only the SELECTs.  
- Check that the table exists: `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'abstracts_rels';`  
  If it doesn’t exist, run `scripts/create_abstracts_rels_table.sql` first, then this fix again.

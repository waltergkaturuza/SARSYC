# Investigating: How User ID "0" Gets Into abstracts_rels

## Hypothesis

User ID "0" is appearing in `abstracts_rels` table alongside valid user IDs (like 3). This causes Payload to throw: **"invalid relationships: 3 0"**.

## Possible Causes

### 1. **Payload's Postgres Adapter Bug** (Most Likely)
When Payload receives `assignedReviewers: []` (empty array), the Postgres adapter might:
- Insert a placeholder row with `users_id = 0` instead of deleting all rows
- Or merge empty arrays incorrectly, preserving old "0" rows

**Evidence:**
- We clear with `assignedReviewers: []` (line 437 in route.ts)
- But "0" still appears in the database

### 2. **Form Data Parsing Issue**
When form data is empty or malformed:
- Empty string `""` might be converted to `"0"`
- Missing field might default to `"0"`
- JSON parsing might create `[0]` instead of `[]`

**Check:** Look at `formData.getAll('assignedReviewers')` - does it ever contain `"0"`?

### 3. **Payload's Relationship Merge Logic**
When updating relationships, Payload might:
- Read existing rows from `abstracts_rels`
- Merge with new values
- If existing row has `users_id = 0`, it gets preserved

**Evidence:** We now clear first (line 434-439), but old "0" rows might have existed before this fix.

### 4. **Database Default Value**
The `abstracts_rels.users_id` column might have a default value of `0`:
```sql
-- Check if column has default
SELECT column_default 
FROM information_schema.columns 
WHERE table_name = 'abstracts_rels' 
  AND column_name = 'users_id';
```

## Diagnostic Queries

Run these in Neon SQL Editor to investigate:

### 1. Find all abstracts with user 0 AND user 3 together:
```sql
SELECT 
  ar.parent_id AS abstract_id,
  a.title,
  STRING_AGG(ar.users_id::text, ', ' ORDER BY ar.users_id) as all_user_ids,
  COUNT(*) as relationship_count
FROM abstracts_rels ar
JOIN abstracts a ON a.id = ar.parent_id
WHERE ar.path = 'assignedReviewers'
GROUP BY ar.parent_id, a.title
HAVING COUNT(DISTINCT CASE WHEN ar.users_id = 0 THEN 1 END) > 0
  AND COUNT(DISTINCT CASE WHEN ar.users_id = 3 THEN 1 END) > 0;
```

### 2. Check when "0" rows were created (if you have timestamps):
```sql
SELECT 
  ar.*,
  a.title,
  a.updated_at AS abstract_updated
FROM abstracts_rels ar
JOIN abstracts a ON a.id = ar.parent_id
WHERE ar.path = 'assignedReviewers'
  AND ar.users_id = 0
ORDER BY a.updated_at DESC;
```

### 3. Check if "0" appears with specific abstract IDs:
```sql
-- Which abstracts have "0"?
SELECT DISTINCT 
  ar.parent_id,
  a.title,
  a.status,
  COUNT(DISTINCT CASE WHEN ar.users_id = 0 THEN 1 END) as has_zero,
  COUNT(DISTINCT CASE WHEN ar.users_id != 0 THEN ar.users_id END) as valid_reviewer_count
FROM abstracts_rels ar
JOIN abstracts a ON a.id = ar.parent_id
WHERE ar.path = 'assignedReviewers'
GROUP BY ar.parent_id, a.title, a.status
HAVING COUNT(DISTINCT CASE WHEN ar.users_id = 0 THEN 1 END) > 0;
```

## Code Flow Analysis

### When Saving from Admin UI:

1. **Form submits** → `AbstractForm.tsx` (line 265-304)
   - Filters out "0" before sending ✅
   - Only sends valid reviewer IDs ✅

2. **API receives** → `route.ts` (line 79-126)
   - Parses `formData.getAll('assignedReviewers')`
   - Filters out "0" ✅
   - Builds `finalAssignedReviewers` array ✅

3. **Payload update** → `route.ts` (line 434-448)
   - **First**: Clears with `assignedReviewers: []` 
   - **Then**: Sets with `assignedReviewers: finalCheck`
   - Should delete all old rows, then insert new ones ✅

4. **Collection hook** → `Abstracts.ts` (line 237-450)
   - `beforeChange` hook filters out "0" ✅
   - Validates IDs exist in database ✅

### The Problem

Even with all these filters, "0" still appears. This suggests:

**Either:**
- Payload's Postgres adapter has a bug when handling empty arrays
- Old "0" rows existed before our fixes and weren't cleaned
- There's another code path (maybe Payload admin UI?) that bypasses our filters

## Next Steps

1. **Run diagnostic queries** to see which abstracts have "0"
2. **Check if "0" rows are old** (created before our fixes)
3. **Clean all "0" rows** using SQL:
   ```sql
   DELETE FROM abstracts_rels
   WHERE path = 'assignedReviewers'
     AND users_id = 0;
   ```
4. **Monitor** - after cleaning, see if "0" appears again when saving

## Files to Watch

- `src/app/api/admin/abstracts/[id]/route.ts` - API route (lines 79-126, 434-448)
- `src/payload/collections/Abstracts.ts` - Collection hook (lines 237-450)
- `src/components/admin/forms/AbstractForm.tsx` - Form submission (lines 265-304)
- **Database**: `abstracts_rels` table - where "0" actually lives

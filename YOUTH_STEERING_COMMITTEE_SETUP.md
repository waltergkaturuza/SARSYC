# Youth Steering Committee - Admin Panel Setup Verification

## ✅ Configuration Checklist

### 1. Collection File
- ✅ File exists: `src/payload/collections/YouthSteeringCommittee.ts`
- ✅ Properly exported: `export default addAuditHooks(YouthSteeringCommittee)`
- ✅ Has labels: `singular` and `plural` defined
- ✅ Admin config: `group: 'Conference'` matches other collections
- ✅ Access control: Proper read/create/update/delete permissions

### 2. Payload Config Registration
- ✅ Imported: `import YouthSteeringCommittee from './collections/YouthSteeringCommittee'`
- ✅ Added to collections array: Position 16 (after Volunteers, before globals)

### 3. Admin Pages Created
- ✅ List page: `/admin/youth-steering-committee/page.tsx`
- ✅ View page: `/admin/youth-steering-committee/[id]/page.tsx`
- ✅ Edit page: `/admin/youth-steering-committee/[id]/edit/page.tsx`
- ✅ New page: `/admin/youth-steering-committee/new/page.tsx`

### 4. API Routes Created
- ✅ POST: `/api/admin/youth-steering-committee/route.ts`
- ✅ PATCH: `/api/admin/youth-steering-committee/[id]/route.ts`
- ✅ DELETE: `/api/admin/youth-steering-committee/[id]/route.ts`

### 5. Public Page Created
- ✅ Public page: `/about/youth-steering-committee/page.tsx`

## 🔍 Troubleshooting: Collection Not Showing in Admin Panel

If the collection is not visible in the admin sidebar after deployment:

### Step 1: Verify Build Success
- Check Vercel deployment logs for any errors
- Ensure the build completed successfully
- Look for any TypeScript or import errors

### Step 2: Clear Browser Cache
- Hard refresh the admin panel: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache and cookies for the admin domain
- Try incognito/private browsing mode

### Step 3: Verify Database Table
The collection should create a table automatically. Check if the table exists:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'youth_steering_committee';
```

### Step 4: Check Payload Admin Access
- Ensure you're logged in as an admin user
- Verify your user role has access to create/update collections
- Check browser console for any JavaScript errors

### Step 5: Verify Collection Order
The collection should appear in the "Conference" group, alphabetically after "Volunteers". Expected order:
1. Registrations
2. Abstracts
3. Speakers
4. Sessions
5. Participants
6. Volunteers
7. **Youth Steering Committee** ← Should be here

### Step 6: Direct URL Access
Try accessing the collection directly:
- List: `https://www.sarsyc.org/admin/collections/youth-steering-committee`
- If this works but sidebar doesn't show it, it's a UI caching issue

## 📝 Expected Behavior

After successful deployment:
1. **Admin Sidebar**: Should show "Youth Steering Committee" under "Conference" group
2. **Collection Page**: Should display empty state with "Add Member" button
3. **Create Form**: Should allow adding members with all fields
4. **Public Page**: Should display members at `/about/youth-steering-committee`

## 🚀 Next Steps After Deployment

1. **Access Admin Panel**: Go to `https://www.sarsyc.org/admin`
2. **Navigate to Collection**: Click "Youth Steering Committee" in sidebar
3. **Add First Member**: Click "Create New" and fill in the form
4. **Verify Public Display**: Check `/about/youth-steering-committee` to see the member

## 🔧 If Still Not Visible

If the collection still doesn't appear after all checks:

1. **Check Payload Version**: Ensure Payload CMS version supports the configuration
2. **Review Build Logs**: Look for any warnings about the collection
3. **Database Migration**: May need to manually create the table if auto-migration failed
4. **Contact Support**: If all else fails, check Payload CMS documentation or support

---

**Last Updated**: After commit `0137ae4`
**Status**: Configuration complete, awaiting deployment verification

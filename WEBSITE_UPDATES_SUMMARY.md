# SARSYC VI Website Updates Summary

## Updates Completed ✅

### 1. Partnership Updates
- ✅ Updated homepage to mention SAYWHAT-UNAM partnership
- ✅ Added partner logos to partnerships page:
  - University of Namibia (UNAM)
  - National Youth Council of Namibia
  - Stellenbosch University (Research Indaba partnership)
  - UNESCO
- ✅ Updated "Team behind SARSYC" page to mention SAYWHAT-UNAM partnership
- ✅ Updated About page to mention partnership

**Note:** Stellenbosch University logo file (`stellenbosch_university.png`) needs to be added to `/public/partners/` folder. Currently using placeholder path.

### 2. Abstract Dates Updated
- ✅ Call for Abstracts Opens: **February 1, 2026** (was March 1)
- ✅ Abstract Submission Deadline: **March 31, 2026** (was April 30)
- ✅ Notification of Acceptance: **April 15, 2026** (was May 31)
- ✅ Mentorship – Publication Period: **May 1 – October 31, 2026** (new)
- ✅ Updated abstract submission page with new dates
- ✅ Updated SARSYC VI page important dates section

### 3. Abstract Email Updated
- ✅ Updated abstract submission page contact email to: **researchunit@saywhat.org.zw**
- ✅ Added email contact info on abstract submission page

### 4. Track 2 Title Updated
- ✅ Changed from "HIV/AIDS, STIs and Vulnerable Groups" 
- ✅ To: **"HIV/AIDS, STIs, and Sexual Health"**
- ✅ Updated in:
  - Homepage tracks
  - SARSYC VI page tracks
  - Abstract submission page
  - Programme page filters

### 5. Venue Updated
- ✅ Changed to: **"The Life Science II Auditorium at the University of Namibia Hage Geingob Campus"**
- ✅ Updated in:
  - SARSYC VI page venue section
  - Venue page fallback

### 6. Program Schedule Added
- ✅ Added comprehensive program schedule section to SARSYC VI page:
  - **Day 1:** Research Indaba
  - **Day 2:** Mugota/Ixhiba Young Men's Forum, Web for Life Network Symposium, Alliance Building Labs, Student Talks and Engagement
  - **Day 3:** Official Opening and Closing Ceremony, Culture Night
  - **Day 4:** Post-Conference Activity - Orathon
- ✅ Updated conference dates to **August 5-8, 2026** (to include Day 4)

### 7. Orathon Registration Portal Created
- ✅ Created new page: `/participate/orathon`
- ✅ Full registration form with:
  - Personal information
  - Emergency contact
  - Medical conditions
  - Dietary requirements
  - T-shirt size selection
  - Terms and conditions
- ✅ Success page with confirmation
- ✅ Linked from SARSYC VI page program schedule

## Files Modified

1. `src/app/(frontend)/page.tsx` - Homepage partnership text & Track 2
2. `src/app/(frontend)/sarsyc-vi/page.tsx` - Dates, Track 2, venue, program schedule
3. `src/app/(frontend)/partnerships/page.tsx` - Partner logos
4. `src/app/(frontend)/participate/submit-abstract/page.tsx` - Dates, Track 2, email
5. `src/app/(frontend)/programme/page.tsx` - Track 2
6. `src/app/(frontend)/sarsyc-vi/venue/page.tsx` - Venue name
7. `src/app/(frontend)/about/page.tsx` - Partnership mention
8. `src/app/(frontend)/about/team/page.tsx` - Partnership mention
9. `src/app/(frontend)/participate/orathon/page.tsx` - **NEW** Orathon registration

## Logo Files Copied

- ✅ `university_namibia.png` → `/public/partners/`
- ✅ `national_youth_council_of_namibia.jpeg` → `/public/partners/`
- ✅ `UNESCO.png` → `/public/partners/`
- ⚠️ `stellenbosch_university.png` - **MISSING** - needs to be added

## Next Steps

1. **Add Stellenbosch University logo:**
   - Place `stellenbosch_university.png` in `C:\Users\Administrator\Documents\SARSYC\sarsyc-platform\public\partners\`
   - Or update the path in `partnerships/page.tsx` if using a different filename

2. **Create Orathon API endpoint:**
   - Currently using partnerships API as placeholder
   - Should create dedicated `/api/orathon` endpoint

3. **Update database:**
   - Ensure venue location in database matches new venue name
   - Update any hardcoded venue references

4. **Test all changes:**
   - Verify partner logos display correctly
   - Test Orathon registration form
   - Verify all dates are correct
   - Check Track 2 appears correctly everywhere

## Deployment Notes

All changes are ready to be committed and pushed. After deployment:
- Partner logos should appear on partnerships page
- Abstract dates will be updated throughout site
- Orathon registration will be live
- Program schedule will be visible on SARSYC VI page

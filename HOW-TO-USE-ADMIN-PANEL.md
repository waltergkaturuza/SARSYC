# 🎨 HOW TO USE THE ADMIN PANEL - COMPLETE GUIDE

**For:** SAYWHAT Team  
**Platform:** SARSYC VI (Next.js + Payload CMS)  
**Date:** December 22, 2025

---

## 🚀 GETTING STARTED

### Step 1: Access the Admin Panel

1. Make sure the development server is running:
   ```powershell
   cd sarsyc-platform
   npm run dev
   ```

2. Open your browser and go to:
   **http://localhost:3000/admin**

3. **First Time:** Create your admin account:
   - Email: admin@sarsyc.org
   - Password: (create a strong password)
   - First Name: Your name
   - Last Name: Your last name
   - Role: Admin

4. Click **Create** and you're in! 🎉

---

## 📊 ADMIN DASHBOARD TOUR

### Left Sidebar - Your Navigation

```
COLLECTIONS (Database Content)
├── Conference
│   ├── Registrations (view/manage all registrations)
│   ├── Abstracts (review submissions)
│   ├── Speakers (add/edit speaker profiles)
│   └── Sessions (manage programme schedule)
│
├── Content
│   ├── Resources (upload conference materials)
│   ├── News (publish news articles)
│   ├── Partners (manage sponsors/partners)
│   ├── FAQs (add frequently asked questions)
│   └── Media (file uploads)
│
└── Admin
    └── Users (manage admin users)

GLOBALS (Site-Wide Settings)
├── Site Settings (conference info, dates, contact)
├── Header (navigation menu)
└── Footer (footer links)
```

---

## 🎯 COMMON TASKS - STEP BY STEP

### 1. ADD A KEYNOTE SPEAKER

**Step-by-Step:**

1. Click **Collections → Speakers** in sidebar
2. Click **Create New** button (top right)
3. Fill in the form:

   **Basic Information:**
   - **Name:** Dr. Amina Osman
   - **Professional Title:** Professor of Public Health
   - **Organization:** University of Cape Town
   - **Country:** South Africa

   **Photo:**
   - Click **Choose File** under "Professional Photo"
   - Upload a professional headshot (square format, min 500x500px)
   - Add **Alt Text** (required): "Dr. Amina Osman headshot"
   - Click **Upload**

   **Biography:**
   - Write 2-3 paragraphs about the speaker
   - Use the rich text editor (bold, italic, lists, etc.)

   **Speaker Type:**
   - Check ☑ **Keynote Speaker**
   - You can select multiple (e.g., also "Plenary Speaker")

   **Featured on Homepage:**
   - Check ☑ **Feature on Homepage** (to show in featured speakers)

   **Social Media (optional):**
   - Twitter: @aminaosman
   - LinkedIn: linkedin.com/in/amina-osman
   - Website: www.aminaosman.com

4. Click **Save** (bottom right)

**✅ Done!** The speaker is now in the database and will appear on the Speakers page!

---

### 2. PUBLISH A NEWS ARTICLE

**Step-by-Step:**

1. Click **Collections → News** in sidebar
2. Click **Create New**
3. Fill in:

   **Title:** "SARSYC VI Announces Keynote Speakers"
   
   **URL Slug:** (auto-generated from title, or customize)
   - Example: `keynote-speakers-announced`
   
   **Excerpt:** (1-2 sentences, max 200 characters)
   - "We're excited to announce our amazing keynote speakers for SARSYC VI in Windhoek!"
   
   **Content:** (main article text)
   - Write your article using the rich text editor
   - Add headings, bold text, bullet points, etc.
   - Paste links
   
   **Featured Image:**
   - Upload an image (1200x630px recommended)
   - Add alt text
   
   **Category:**
   - Check ☑ **Speaker Announcements**
   - You can select multiple categories
   
   **Tags:** (optional)
   - Click **Add Tag**
   - Type: keynote, speakers, SARSYC VI
   
   **Author:**
   - Select yourself from dropdown
   
   **Publication Status:**
   - Select **Published** (or **Draft** to save without publishing)
   
   **Published Date:**
   - Select today's date and time
   
   **Feature on Homepage:**
   - Check ☑ if you want this on homepage

4. Click **Save**

**✅ Done!** Article is now live on website at: `/news/keynote-speakers-announced`

---

### 3. MANAGE CONFERENCE REGISTRATIONS

**View All Registrations:**

1. Click **Collections → Registrations**
2. You'll see a table with all registrations:
   - Name, Email, Category, Status, Date
3. Click on any row to view full details

**Export to Excel/CSV:**

1. On Registrations page
2. Click **Export** button (top right)
3. Choose format: CSV or JSON
4. Download and open in Excel

**Update Registration Status:**

1. Click on a registration
2. Scroll to **Registration Status**
3. Change from "Pending" to **"Confirmed"**
4. Add **Admin Notes** if needed
5. Click **Save**
6. (Auto-sends confirmation email to participant)

**Filter Registrations:**

- Use search box at top
- Filter by category, status, date
- Sort by clicking column headers

---

### 4. REVIEW ABSTRACT SUBMISSIONS

**Step-by-Step:**

1. Click **Collections → Abstracts**
2. You'll see all submissions with:
   - Title, Primary Author, Track, Status, Date

**Review an Abstract:**

1. Click on an abstract to open
2. Read:
   - Title, Abstract text
   - Track, Keywords
   - Primary author details
   - Download attached file (if any)

**Update Status:**

1. Scroll to **Status** field
2. Change to:
   - **Under Review** (when being reviewed)
   - **Revisions Requested** (if changes needed)
   - **Accepted** (if approved)
   - **Rejected** (if not accepted)

3. If "Revisions Requested" or "Rejected":
   - Add **Reviewer Comments** explaining why

4. If "Accepted":
   - Select **Assigned Session** (link to a session)

5. Click **Save**
6. (Auto-sends email to author with status update)

---

### 5. ADD A PARTNER/SPONSOR

**Step-by-Step:**

1. Click **Collections → Partners**
2. Click **Create New**
3. Fill in:

   **Name:** United Nations Population Fund (UNFPA)
   
   **Logo:**
   - Upload partner logo (transparent PNG recommended)
   - Alt text: "UNFPA Logo"
   
   **Description:**
   - Write about the partner (optional)
   
   **Partnership Type:**
   - Select: Funding Partner
   
   **Sponsorship Tier:** (if applicable)
   - Select: Gold
   
   **Website:**
   - https://www.unfpa.org
   
   **Currently Active:**
   - Check ☑
   
   **SARSYC Editions:**
   - Select: SARSYC V, SARSYC VI
   
   **Display Order:**
   - Lower numbers appear first
   - E.g., 1 for platinum partners, 10 for bronze

4. Click **Save**

**✅ Partner logo now appears on Partnerships page!**

---

### 6. UPLOAD A RESOURCE (Conference Report, Paper, etc.)

**Step-by-Step:**

1. Click **Collections → Resources**
2. Click **Create New**
3. Fill in:

   **Title:** "SARSYC V Conference Report 2022"
   
   **URL Slug:** (auto-generated or customize)
   - sarsyc-v-conference-report-2022
   
   **Description:**
   - Write 2-3 sentences summarizing the resource
   
   **Resource File:**
   - Click **Choose File**
   - Upload PDF/Word document
   - Add alt text
   
   **Type:**
   - Select: Conference Report
   
   **Topics:**
   - Check relevant topics (can select multiple)
   
   **Year:** 2022
   
   **SARSYC Edition:** SARSYC V (2022)
   
   **Authors:**
   - Click **Add Author**
   - Enter author names
   
   **Country/Region:** Southern Africa
   
   **Language:** English
   
   **Feature on Resource Page:**
   - Check ☑ for important resources

4. Click **Save**

**✅ Resource is now downloadable on Resources page!**

---

### 7. CREATE A FAQ

**Step-by-Step:**

1. Click **Collections → FAQs**
2. Click **Create New**
3. Fill in:

   **Question:**
   - "How do I register for SARSYC VI?"
   
   **Answer:**
   - Write a clear answer (can use rich text formatting)
   - Example: "Visit our Registration page and complete the online form..."
   
   **Category:**
   - Select: Registration
   
   **Display Order:**
   - Enter number (1 shows first, 100 shows last)

4. Click **Save**

**✅ FAQ now appears on FAQ page!**

---

### 8. CONFIGURE SITE SETTINGS

**Step-by-Step:**

1. Click **Globals → Site Settings**
2. You'll see tabs:

   **Conference Information:**
   - Conference Name: SARSYC VI
   - Theme: Align for Action: Sustaining Progress in Youth Health and Education
   - Start Date: August 5, 2026 (9:00 AM)
   - End Date: August 7, 2026
   - Location: Windhoek, Namibia
   - Venue: [Venue name]

   **Registration Settings:**
   - ☑ Registration Open (check when ready)
   - Registration Opens: May 20, 2026
   - Early Bird Deadline: June 15, 2026
   - Registration Closes: July 31, 2026

   **Abstract Submission:**
   - ☑ Abstract Submission Open
   - Deadline: June 30, 2026

   **Contact Information:**
   - Email: info@sarsyc.org
   - Phone: +264 000 000 000
   - Address: [Full address]

   **Social Media:**
   - Facebook: https://facebook.com/saywhat
   - Twitter: https://twitter.com/saywhat
   - Instagram: https://instagram.com/saywhat
   - LinkedIn: https://linkedin.com/company/saywhat
   - YouTube: https://youtube.com/@saywhat

   **SEO & Analytics:**
   - Google Analytics ID: G-XXXXXXXXXX

3. Click **Save**

**✅ Settings applied across entire website!**

---

## 🎯 POWER USER TIPS

### Bulk Actions

**Select multiple items:**
1. Check boxes next to items
2. Use **Bulk Actions** dropdown
3. Delete, change status, etc.

### Search & Filter

**Find content quickly:**
- Use search box at top of any collection
- Click column headers to sort
- Use filters on the right sidebar

### Keyboard Shortcuts

- **Cmd/Ctrl + S:** Save
- **Cmd/Ctrl + K:** Search
- **Esc:** Close modal

### Rich Text Editor

**Format your content:**
- **Bold:** Select text, click B button
- **Italic:** Select text, click I button
- **Links:** Select text, click link icon, paste URL
- **Headings:** Use H2, H3, H4 (never H1)
- **Lists:** Click bullet or numbered list icons
- **Images:** Click image icon, upload

---

## 📧 EMAIL AUTOMATION (Auto-Sent)

These emails send automatically:

| Trigger | Email Sent To | Content |
|---------|---------------|---------|
| **New Registration** | Participant | Confirmation with registration ID and next steps |
| **Abstract Submitted** | Author | Confirmation with submission ID and review timeline |
| **Abstract Status Changed** | Author | Update on review status (accepted/rejected/revisions) |

**Email settings configured in `.env` file (SMTP settings)**

---

## 🔐 USER ROLES & PERMISSIONS

### Admin (Full Access)
- ✅ Can do everything
- ✅ Create/edit/delete all content
- ✅ Manage users
- ✅ Configure settings

### Editor
- ✅ Create/edit content (news, resources, speakers)
- ✅ Publish content
- ❌ Cannot delete or manage users

### Contributor
- ✅ Create content
- ⚠️ Cannot publish (submits for review)
- ❌ Cannot delete

---

## 🆘 TROUBLESHOOTING

### Issue: Can't Login
**Solution:**
- Check email and password are correct
- Click "Forgot Password" to reset
- Check with IT admin

### Issue: Upload Failed
**Solution:**
- Check file size (max 10MB)
- Check file type (images: jpg/png, docs: pdf/word)
- Try smaller file or different format

### Issue: Changes Not Showing on Website
**Solution:**
- Click **Save** (bottom of form)
- Refresh website (Ctrl+F5)
- Clear browser cache

### Issue: Can't Find Content
**Solution:**
- Use search box at top
- Check you're in correct collection
- Check filters aren't hiding content

---

## 📞 NEED HELP?

**For support:**
- **Technical issues:** Contact IT Team
- **Content questions:** Contact Communications Lead  
- **Training:** Review training videos in `07-Training-Materials/`

---

## 🎉 YOU'RE NOW A POWER USER!

**You can now:**
- ✅ Add speakers, news articles, resources
- ✅ Manage registrations and abstracts
- ✅ Configure site settings
- ✅ Publish content independently
- ✅ Export data

**No coding required! Everything through the beautiful admin panel.** 🎨

---

**Questions?** Contact your web consultant or refer to Payload CMS docs: https://payloadcms.com/docs



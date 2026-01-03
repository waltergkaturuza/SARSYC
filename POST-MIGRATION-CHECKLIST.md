# Post-Migration Checklist: sarsyc.org → Vercel

Your site is now live at `sarsyc.org`! Here's what you need to do next to ensure everything is properly configured.

---

## ✅ Immediate Actions (Do These Now)

### 1. Update Environment Variables in Vercel

**Critical:** Update your environment variables to use the new domain.

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your SARSYC project
   - Go to **Settings** → **Environment Variables**

2. **Update These Variables:**
   ```
   PAYLOAD_PUBLIC_SERVER_URL=https://sarsyc.org
   NEXT_PUBLIC_SERVER_URL=https://sarsyc.org
   ```

3. **If you have these, update them too:**
   ```
   NEXT_PUBLIC_SITE_DOMAIN=sarsyc.org
   SMTP_FROM=noreply@sarsyc.org
   ```

4. **Redeploy After Updating**
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**
   - This ensures all URLs in your app use the new domain

---

### 2. Test Critical Functionality

Run through these tests to ensure everything works:

#### ✅ Homepage
- [ ] Visit https://sarsyc.org
- [ ] Check all images load correctly
- [ ] Test navigation links
- [ ] Verify countdown timer works

#### ✅ Registration
- [ ] Go to https://sarsyc.org/participate/register
- [ ] Fill out a test registration
- [ ] Submit and verify confirmation
- [ ] Check email received (if configured)

#### ✅ Abstract Submission
- [ ] Go to https://sarsyc.org/participate/submit-abstract
- [ ] Test form submission
- [ ] Verify confirmation message

#### ✅ Admin Panel
- [ ] Visit https://sarsyc.org/admin
- [ ] Log in with admin credentials
- [ ] Test creating/editing content
- [ ] Verify file uploads work

#### ✅ All Pages
- [ ] Test all navigation links
- [ ] Check About page
- [ ] Check Programme page
- [ ] Check Venue page (map should work)
- [ ] Check FAQ page
- [ ] Check Contact page

---

### 3. Verify Email Configuration

If you're using email with `@sarsyc.org`:

1. **Check MX Records in Bluehost**
   - Go to DNS management
   - Ensure MX records are still present
   - These should NOT have been changed
   - Email hosting is separate from web hosting

2. **Test Email Sending**
   - Try password reset functionality
   - Check if welcome emails send (for new speakers/abstracts)
   - Verify email addresses in admin panel

3. **Update Email Settings**
   - In Vercel environment variables, ensure:
     ```
     SMTP_FROM=noreply@sarsyc.org
     ```
   - Or your preferred email address

---

### 4. Update External References

Search for and update any hardcoded URLs:

#### In Your Codebase
- [ ] Check for any hardcoded `vercel.app` URLs
- [ ] Update any API endpoint references
- [ ] Update any image URLs
- [ ] Update any external links

#### In Content
- [ ] Update social media links if they reference the old site
- [ ] Update any documentation
- [ ] Update any email templates

---

### 5. SEO & Analytics

#### Google Search Console
- [ ] Add new property: https://sarsyc.org
- [ ] Verify ownership
- [ ] Submit sitemap: https://sarsyc.org/sitemap.xml
- [ ] Request indexing for important pages

#### Google Analytics (if using)
- [ ] Update domain in Google Analytics settings
- [ ] Verify tracking code is working

#### Social Media
- [ ] Update Facebook page links
- [ ] Update Twitter/X profile links
- [ ] Update LinkedIn links
- [ ] Update Instagram links

---

### 6. Security & Performance

#### SSL Certificate
- [ ] Verify HTTPS works: https://sarsyc.org
- [ ] Check for padlock icon in browser
- [ ] Test SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=sarsyc.org

#### Performance
- [ ] Run PageSpeed test: https://pagespeed.web.dev/
- [ ] Check Core Web Vitals
- [ ] Verify images are optimized
- [ ] Test on mobile devices

---

### 7. Backup & Monitoring

#### Set Up Monitoring
- [ ] Enable Vercel Analytics (if not already)
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure error tracking (Vercel has built-in)

#### Database Backups
- [ ] Verify Neon PostgreSQL backups are enabled
- [ ] Test database restore process
- [ ] Document backup schedule

---

### 8. Cancel Old Hosting (Optional)

**Only after everything is verified working:**

1. **Wait 1-2 weeks** to ensure everything is stable
2. **Backup old WordPress site** (if you need content from it)
3. **Cancel Bluehost WordPress hosting** (if no longer needed)
4. **Keep domain registration** with Bluehost (or transfer if preferred)

**Important:** Don't cancel domain registration, only the hosting service!

---

## 🔍 Verification Checklist

### DNS Verification
- [ ] A record for `@` points to `216.198.79.1`
- [ ] CNAME for `www` points to Vercel
- [ ] Both domains resolve correctly
- [ ] SSL certificates are valid

### Functionality Verification
- [ ] Homepage loads correctly
- [ ] All pages accessible
- [ ] Forms submit successfully
- [ ] Admin panel works
- [ ] File uploads work
- [ ] Email sending works (if configured)

### Performance Verification
- [ ] Site loads quickly (< 3 seconds)
- [ ] Images optimized
- [ ] Mobile responsive
- [ ] No console errors

---

## 📝 Important Notes

### Environment Variables
After updating environment variables, **always redeploy** for changes to take effect.

### Email Configuration
If you use email with `@sarsyc.org`, your MX records should still point to your email provider (not Vercel). Email and web hosting are separate.

### Old WordPress Site
If you need content from the old WordPress site:
- Export content before canceling hosting
- Migrate important content to new site
- Keep backups of old site

---

## 🎯 Next Steps

1. **Content Migration** (if needed)
   - Migrate important content from WordPress
   - Add real speakers, news, resources
   - Update all content with current information

2. **Marketing & Promotion**
   - Announce new site launch
   - Update all marketing materials
   - Share on social media

3. **Ongoing Maintenance**
   - Regular content updates
   - Monitor performance
   - Keep dependencies updated
   - Regular backups

---

## 🆘 Troubleshooting

### Issue: Some pages show old WordPress site
**Solution:** Clear browser cache or use incognito mode. DNS propagation can take up to 48 hours.

### Issue: Images not loading
**Solution:** Check image URLs in content. Update any hardcoded URLs to use relative paths or new domain.

### Issue: Email not working
**Solution:** Verify MX records in Bluehost DNS settings. Email hosting is separate from web hosting.

### Issue: Admin panel shows wrong URL
**Solution:** Update `PAYLOAD_PUBLIC_SERVER_URL` in Vercel environment variables and redeploy.

---

## ✅ Completion Checklist

- [ ] Environment variables updated
- [ ] Site redeployed with new domain
- [ ] All pages tested and working
- [ ] Email configuration verified
- [ ] SSL certificate valid
- [ ] Google Search Console configured
- [ ] Analytics updated
- [ ] Performance tested
- [ ] Mobile responsive verified
- [ ] Old hosting canceled (if applicable)

---

**Congratulations! Your site is now live at sarsyc.org! 🎉**

If you encounter any issues, refer to this checklist or check the troubleshooting section.


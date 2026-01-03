# Domain Migration Guide: Bluehost → Vercel

This guide will help you point your `sarsyc.org` domain from Bluehost to your new Vercel deployment.

## 📋 Prerequisites

- Access to your Bluehost account
- Access to your Vercel account
- Your domain: `sarsyc.org`

---

## 🚀 Step 1: Add Domain to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your SARSYC project

2. **Navigate to Domain Settings**
   - Click on **Settings** tab
   - Click on **Domains** in the left sidebar

3. **Add Your Domain**
   - Click **Add Domain** button
   - Enter: `sarsyc.org`
   - Click **Add**

4. **Vercel will show you DNS configuration**
   - You'll see DNS records that need to be added
   - **Important:** Note down these records (especially the A record or CNAME)

---

## 🔧 Step 2: Configure DNS in Bluehost

### Option A: Using A Record (Recommended for root domain)

1. **Log into Bluehost**
   - Go to: https://www.bluehost.com/my-account/domain-center-update/details?domain=sarsyc.org&tab=dns
   - Or navigate: My Account → Domain Center → DNS Management

2. **Find Current DNS Records**
   - Look for existing A records pointing to WordPress
   - Note: You may see records like:
     - `@` or blank → pointing to Bluehost IP
     - `www` → pointing to Bluehost IP

3. **Update A Record for Root Domain**
   - Find the A record for `@` (or blank/root)
   - **Delete or edit** this record
   - **Add new A record:**
     - **Type:** A
     - **Name:** `@` (or leave blank)
     - **Value:** `76.76.21.21` (Vercel's IP - this is standard, but check Vercel dashboard for exact value)
     - **TTL:** 3600 (or default)

4. **Update CNAME for www Subdomain**
   - Find the CNAME record for `www`
   - **Delete or edit** this record
   - **Add new CNAME record:**
     - **Type:** CNAME
     - **Name:** `www`
     - **Value:** `cname.vercel-dns.com` (or the value Vercel shows you)
     - **TTL:** 3600 (or default)

### Option B: Using CNAME (Alternative - if Bluehost supports CNAME flattening)

Some registrars support CNAME flattening for root domains. Check if Bluehost supports this:

1. **Add CNAME for Root**
   - **Type:** CNAME
   - **Name:** `@` (or blank)
   - **Value:** `cname.vercel-dns.com` (or Vercel's provided value)

2. **Add CNAME for www**
   - **Type:** CNAME
   - **Name:** `www`
   - **Value:** `cname.vercel-dns.com`

---

## ⚙️ Step 3: Update Environment Variables in Vercel

After adding the domain, update your environment variables:

1. **Go to Vercel Project Settings**
   - Settings → Environment Variables

2. **Update these variables:**
   ```
   PAYLOAD_PUBLIC_SERVER_URL=https://sarsyc.org
   NEXT_PUBLIC_SERVER_URL=https://sarsyc.org
   ```

3. **Redeploy** your project after updating environment variables
   - Go to Deployments tab
   - Click the three dots (⋯) on latest deployment
   - Click **Redeploy**

---

## ⏱️ Step 4: Wait for DNS Propagation

DNS changes can take **24-48 hours** to fully propagate, but usually work within **1-4 hours**.

**Check DNS propagation:**
- Visit: https://www.whatsmydns.net/#A/sarsyc.org
- Visit: https://dnschecker.org/#A/sarsyc.org

You should see the new Vercel IP address appearing across different locations.

---

## ✅ Step 5: Verify Everything Works

1. **Test Root Domain**
   - Visit: https://sarsyc.org
   - Should show your new Vercel site

2. **Test www Subdomain**
   - Visit: https://www.sarsyc.org
   - Should redirect to or show the same site

3. **Test SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Check that the padlock icon appears in browser
   - Should be valid HTTPS

4. **Test Admin Panel**
   - Visit: https://sarsyc.org/admin
   - Should load correctly

---

## 🔍 Troubleshooting

### Issue: Domain still shows old WordPress site

**Solutions:**
1. **Clear DNS cache:**
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
   - Or use: https://1.1.1.1/help (Cloudflare's DNS)

2. **Check DNS records are correct:**
   - Use: `nslookup sarsyc.org` in terminal
   - Should show Vercel's IP address

3. **Wait longer:** DNS can take up to 48 hours

### Issue: SSL certificate not working

**Solution:**
- Vercel automatically provisions SSL certificates
- Wait 5-10 minutes after DNS propagation
- If still not working, check Vercel dashboard for SSL status

### Issue: www subdomain not working

**Solution:**
- Ensure CNAME record for `www` is correctly set
- Check Vercel dashboard shows both `sarsyc.org` and `www.sarsyc.org` as configured

### Issue: Site shows "Domain not configured"

**Solution:**
- Go to Vercel → Settings → Domains
- Ensure domain is properly added and verified
- Check that domain shows as "Valid Configuration"

---

## 📝 Important Notes

### Before Making Changes:

1. **Backup Current DNS Records**
   - Take screenshots of current DNS settings
   - Note down all existing records
   - This helps if you need to rollback

2. **Check Email Configuration**
   - If you use email with `@sarsyc.org` (e.g., `admin@sarsyc.org`)
   - You may need to keep MX records pointing to your email provider
   - **Don't delete MX records** unless you're moving email too

3. **Check Other Services**
   - If you have other services using subdomains (e.g., `mail.sarsyc.org`, `ftp.sarsyc.org`)
   - Keep those DNS records intact
   - Only change A/CNAME records for `@` and `www`

### After Migration:

1. **Update Email Settings**
   - If your email uses `@sarsyc.org`, ensure MX records are still correct
   - Email hosting is separate from web hosting

2. **Cancel Bluehost WordPress Hosting** (Optional)
   - Once migration is complete and verified
   - You can cancel WordPress hosting if no longer needed
   - **Keep domain registration** with Bluehost (or transfer if preferred)

---

## 🎯 Quick Reference: DNS Records Needed

```
Type    Name    Value                    TTL
A       @       76.76.21.21              3600
CNAME   www     cname.vercel-dns.com     3600
```

**Note:** The exact values will be shown in your Vercel dashboard. Use those values, not the examples above.

---

## 📞 Need Help?

- **Vercel Support:** https://vercel.com/support
- **Bluehost Support:** https://www.bluehost.com/contact
- **DNS Checker:** https://dnschecker.org

---

## ✅ Checklist

- [ ] Added domain to Vercel dashboard
- [ ] Noted DNS records from Vercel
- [ ] Updated A record for root domain in Bluehost
- [ ] Updated CNAME record for www in Bluehost
- [ ] Updated environment variables in Vercel
- [ ] Redeployed Vercel project
- [ ] Waited for DNS propagation (checked with dnschecker.org)
- [ ] Verified https://sarsyc.org works
- [ ] Verified https://www.sarsyc.org works
- [ ] Verified SSL certificate is valid
- [ ] Tested admin panel
- [ ] Verified email still works (if applicable)

---

**Migration Complete!** 🎉

Your new site should now be live at `sarsyc.org`!


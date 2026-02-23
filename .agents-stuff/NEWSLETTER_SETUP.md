# Newsletter System - Setup Guide

Complete guide to setting up and configuring the newsletter system for sergiocarracedo.es.

## Overview

This newsletter system provides:

- **Subscription forms** in footer and optional toast popup
- **Double opt-in** confirmation via email
- **Monthly automated newsletters** with AI-generated content
- **Gemini AI** for content summarization
- **Resend** for email delivery
- **GitHub Actions** for automation

---

## Prerequisites

Before you begin, you'll need accounts for:

1. **Resend** (https://resend.com)
   - Free tier: 3,000 emails/month
   - Email delivery service

2. **Google AI Studio** (https://aistudio.google.com)
   - Free Gemini API access
   - Used for content generation

3. **GitHub** (you already have this)
   - For Actions automation

---

## Step 1: Setup Resend

### 1.1 Create Resend Account

1. Go to https://resend.com
2. Sign up with your email or GitHub
3. Verify your email

### 1.2 Add and Verify Your Domain

1. In Resend dashboard, go to **Domains**
2. Click "Add Domain"
3. Enter your domain: `sergiocarracedo.es`
4. Add the DNS records Resend provides:

   ```
   Type: TXT
   Name: _resend
   Value: [provided by Resend]

   Type: TXT
   Name: resend._domainkey
   Value: [provided by Resend]
   ```

5. Wait for verification (can take a few minutes to 24 hours)

### 1.3 Get API Key

1. Go to **API Keys** in Resend dashboard
2. Click "Create API Key"
3. Name it: `sergiocarracedo-newsletter`
4. Copy the key (starts with `re_...`)
5. Save it securely - you'll add this to GitHub Secrets

---

## Step 2: Get Gemini API Key

### 2.1 Get API Key

1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the key
4. Save it securely

---

## Step 3: Configure GitHub Secrets

Add the following secrets to your repository:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret" for each:

### Required Secrets:

| Secret Name                    | Value                           | Description                               |
| ------------------------------ | ------------------------------- | ----------------------------------------- |
| `RESEND_API_KEY`               | `re_xxx...`                     | Your Resend API key                       |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `AIza...`                       | Your Gemini API key                       |
| `FROM_EMAIL`                   | `newsletter@sergiocarracedo.es` | Sender email (must match verified domain) |
| `GITHUB_TOKEN`                 | Auto-provided                   | GitHub provides this automatically        |

### Optional Secrets (for custom setup):

| Secret Name    | Value                | Description          |
| -------------- | -------------------- | -------------------- |
| `GITHUB_OWNER` | `sergiocarracedo`    | Your GitHub username |
| `GITHUB_REPO`  | `sergiocarracedo.es` | Your repo name       |

---

## Step 4: Configure Environment Variables (Local Development)

Create a `.env` file in the project root:

```bash
# Resend Configuration
RESEND_API_KEY=re_xxx...
FROM_EMAIL=newsletter@sergiocarracedo.es

# Gemini AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Site Configuration
SITE_URL=https://sergiocarracedo.es

# GitHub Configuration (for local testing)
GITHUB_TOKEN=ghp_xxx...
GITHUB_OWNER=sergiocarracedo
GITHUB_REPO=sergiocarracedo.es
```

**Important:** Add `.env` to your `.gitignore` (should already be there)

---

## Step 5: Update Astro Config (if needed)

Ensure your `astro.config.mjs` has `output: 'hybrid'` or `output: 'server'` for API routes:

```js
export default defineConfig({
  output: 'hybrid', // or 'server'
  // ... rest of config
});
```

---

## Step 6: Test Locally

### 6.1 Start Development Server

```bash
cd /works/sergiocarracedo/newsletter-worktree
pnpm dev
```

### 6.2 Test Subscription Form

1. Open http://localhost:4321
2. Scroll to footer
3. Enter your email in the newsletter form
4. Click "Subscribe"
5. Check your email for confirmation link

### 6.3 Test Newsletter Generation

```bash
# Generate newsletter content (dry run)
node --loader ts-node/esm scripts/generate-newsletter.ts 30
```

This will:

- Scan posts from last 30 days
- Generate AI summaries
- Output newsletter content (without sending)

---

## Step 7: Deploy to Production

### 7.1 Merge to Main Branch

```bash
cd /works/sergiocarracedo/newsletter-worktree
git add .
git commit -m "feat: add newsletter system"
git push origin feature/newsletter
```

Create a pull request and merge to `main`.

### 7.2 Verify GitHub Actions

After merging, check:

1. Go to **Actions** tab in GitHub
2. Verify workflows are present:
   - `Newsletter - Handle Subscription`
   - `Newsletter - Send Monthly`

---

## Step 8: Test in Production

### 8.1 Subscribe via Live Site

1. Visit https://sergiocarracedo.es
2. Use the newsletter form
3. Confirm via email
4. Check `subscribers/subscribers.json` in repo (should update via GitHub Action)

### 8.2 Manually Trigger Newsletter (Test Mode)

1. Go to **Actions** → **Newsletter - Send Monthly**
2. Click "Run workflow"
3. Set:
   - `days_back`: `30`
   - `test_mode`: `true`
4. Click "Run workflow"
5. Check logs to verify it works (won't send emails in test mode)

### 8.3 Send First Real Newsletter

When ready to send your first newsletter:

1. Ensure you have posts from last 30 days
2. Ensure you have confirmed subscribers
3. Go to **Actions** → **Newsletter - Send Monthly**
4. Click "Run workflow"
5. Set:
   - `days_back`: `30`
   - `test_mode`: `false`
6. Click "Run workflow"

---

## Troubleshooting

### "Failed to send confirmation email"

**Issue:** Resend API error
**Solutions:**

1. Verify `RESEND_API_KEY` is correct in GitHub Secrets
2. Check domain is verified in Resend dashboard
3. Check `FROM_EMAIL` matches verified domain

### "No posts found"

**Issue:** No recent posts or all already sent
**Solutions:**

1. Check posts have `pubDate` in last 30 days
2. Check posts don't have `newsletterSent: true` in frontmatter
3. Try increasing `days_back` parameter

### "AI generation failed"

**Issue:** Gemini API error
**Solutions:**

1. Verify `GOOGLE_GENERATIVE_AI_API_KEY` is correct
2. Check you haven't exceeded free tier limits
3. Check API key has proper permissions

### "Subscriber not saved"

**Issue:** GitHub Action not triggering
**Solutions:**

1. Verify `GITHUB_TOKEN` secret exists
2. Check workflow file syntax in `.github/workflows/`
3. Check Actions are enabled in repository settings

---

## Maintenance

### Monthly Schedule

The newsletter automatically sends on the **1st of every month at 9 AM UTC**.

To change the schedule, edit `.github/workflows/newsletter-send.yml`:

```yaml
schedule:
  - cron: '0 9 1 * *' # Minute Hour Day Month Weekday
```

Examples:

- `'0 10 15 * *'` - 15th of month at 10 AM
- `'0 9 * * 1'` - Every Monday at 9 AM
- `'0 12 1,15 * *'` - 1st and 15th at 12 PM

### View Subscribers

Subscribers are stored in `/subscribers/subscribers.json`:

```json
[
  {
    "email": "user@example.com",
    "confirmed": true,
    "subscribeDate": "2026-02-10T12:00:00.000Z",
    "confirmDate": "2026-02-10T12:05:00.000Z",
    "source": "website"
  }
]
```

### Remove Subscriber

1. Edit `/subscribers/subscribers.json`
2. Remove the subscriber entry
3. Commit and push:
   ```bash
   git add subscribers/subscribers.json
   git commit -m "chore: remove subscriber"
   git push
   ```

---

## Cost Estimates

### Current Usage (Free Tier)

- **Resend:** Free for 3,000 emails/month (~100 subscribers × 1 email/month)
- **Gemini:** Free tier (15 requests/minute, 1500 requests/day)
- **GitHub Actions:** Free for public repos

### When You'll Need to Pay

- **Resend:** When exceeding 3,000 emails/month
  - Next tier: $20/month for 50,000 emails
- **Gemini:** Very high usage (unlikely for newsletters)
- **GitHub Actions:** High compute usage (unlikely)

**Estimated monthly cost:** $0 for first 100 subscribers

---

## Security Considerations

### Current Security

- Emails stored in plain text in repository
- Double opt-in confirmation required
- Unsubscribe links provided by Resend
- HTTPS for all endpoints
- API keys in GitHub Secrets

### Enhanced Security (Optional)

For stricter privacy requirements:

1. **Encrypt subscriber data:**

   ```bash
   # Install encryption package
   pnpm add @47ng/cloak

   # Modify handle-subscription.js to encrypt
   ```

2. **Use external database:**
   - Migrate to PostgreSQL/MongoDB
   - Store credentials in GitHub Secrets

3. **Add CAPTCHA:**
   - Use hCaptcha or reCAPTCHA
   - Prevent spam subscriptions

---

## Support

If you encounter issues:

1. Check workflow logs in GitHub Actions
2. Review error messages in email sending logs
3. Test API keys are valid and have proper permissions
4. Verify domain DNS settings in Resend

For more help:

- Resend docs: https://resend.com/docs
- Gemini AI docs: https://ai.google.dev/docs
- GitHub Actions docs: https://docs.github.com/actions

---

## Next Steps

After successful setup:

1. ✅ Monitor first few subscriptions
2. ✅ Test first newsletter in test mode
3. ✅ Send first real newsletter
4. ✅ Review analytics in Resend dashboard
5. ✅ Adjust AI prompts if needed (in `scripts/generate-newsletter.ts`)
6. ✅ Customize email templates (in `src/emails/`)

---

**You're all set! 🎉**

The newsletter system is now ready to automatically collect subscribers and send monthly digests with AI-generated content.

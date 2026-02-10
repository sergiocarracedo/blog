# Newsletter System

Automated monthly newsletter system for sergiocarracedo.es blog.

## Features

- 📧 **Subscription Forms**: Footer form + optional slide-in toast
- ✅ **Double Opt-in**: Email confirmation required
- 🤖 **AI-Generated Content**: Gemini creates engaging summaries
- 📅 **Automated Sending**: Monthly via GitHub Actions
- 📊 **Professional Templates**: React Email components
- 🔒 **Resend Integration**: Reliable email delivery

## Architecture

```
User subscribes
     ↓
Confirmation email sent (Resend)
     ↓
User confirms subscription
     ↓
Stored in subscribers.json (GitHub)
     ↓
Monthly GitHub Action runs
     ↓
Scans posts from last 30 days
     ↓
Generates AI summaries (Gemini)
     ↓
Sends newsletter (Resend)
     ↓
Marks posts as sent
```

## Components

### Frontend

- `/src/components/NewsletterForm.astro` - Subscription form
- `/src/components/NewsletterToast.astro` - Optional popup
- `/src/pages/api/newsletter/subscribe.ts` - Subscription API
- `/src/pages/api/newsletter/confirm.ts` - Confirmation API

### Email Templates

- `/src/emails/WelcomeEmail.tsx` - Confirmation email
- `/src/emails/MonthlyNewsletter.tsx` - Newsletter template

### Scripts

- `/scripts/generate-newsletter.ts` - Content generation with AI
- `/scripts/send-newsletter.js` - Email sending logic
- `/scripts/handle-subscription.js` - Subscriber management

### Automation

- `/.github/workflows/newsletter-subscribe.yml` - Handle subscriptions
- `/.github/workflows/newsletter-send.yml` - Monthly newsletter

### Data

- `/subscribers/subscribers.json` - Subscriber list

## Quick Start

See [NEWSLETTER_SETUP.md](./NEWSLETTER_SETUP.md) for complete setup instructions.

### Requirements

1. Resend account + API key
2. Gemini API key (Google AI Studio)
3. GitHub Secrets configured

### Local Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Test newsletter generation
node --loader ts-node/esm scripts/generate-newsletter.ts 30
```

### Environment Variables

```bash
RESEND_API_KEY=re_xxx...
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
FROM_EMAIL=newsletter@sergiocarracedo.es
SITE_URL=https://sergiocarracedo.es
```

## Usage

### Subscribe

Visit the site and use the newsletter form in the footer or wait for the toast popup.

### Send Newsletter (Manual)

Trigger via GitHub Actions:

1. Go to **Actions** → **Newsletter - Send Monthly**
2. Click "Run workflow"
3. Configure:
   - `days_back`: Number of days to look back (default: 30)
   - `test_mode`: Test without sending (default: false)

### Automated Sending

Runs automatically on the 1st of every month at 9 AM UTC.

## File Structure

```
.
├── .github/
│   └── workflows/
│       ├── newsletter-subscribe.yml    # Subscription handler
│       └── newsletter-send.yml         # Monthly sender
├── scripts/
│   ├── generate-newsletter.ts         # AI content generation
│   ├── send-newsletter.js             # Email sending
│   └── handle-subscription.js         # Subscriber management
├── src/
│   ├── components/
│   │   ├── NewsletterForm.astro       # Subscription form
│   │   └── NewsletterToast.astro      # Optional popup
│   ├── emails/
│   │   ├── WelcomeEmail.tsx           # Confirmation email
│   │   └── MonthlyNewsletter.tsx      # Newsletter template
│   └── pages/
│       └── api/
│           └── newsletter/
│               ├── subscribe.ts        # Subscription API
│               └── confirm.ts          # Confirmation API
├── subscribers/
│   ├── subscribers.json               # Subscriber list
│   └── README.md                      # Subscriber docs
├── NEWSLETTER_SETUP.md                # Setup guide
└── NEWSLETTER_README.md               # This file
```

## Configuration

### Scheduling

Edit `.github/workflows/newsletter-send.yml`:

```yaml
schedule:
  - cron: '0 9 1 * *' # 1st of month at 9 AM UTC
```

### AI Prompts

Edit prompts in `scripts/generate-newsletter.ts`:

- `summaryPrompt` - Monthly summary style
- `teaserPrompt` - Post teaser style

### Email Design

Customize templates in `src/emails/`:

- `WelcomeEmail.tsx` - Confirmation email layout
- `MonthlyNewsletter.tsx` - Newsletter layout

### Toast Behavior

Edit `src/components/NewsletterToast.astro`:

- Scroll trigger: Line 113 (`scrollPercent >= 50`)
- Time trigger: Line 107 (`15000` = 15 seconds)
- Dismiss duration: Line 48 (`DISMISS_DURATION_DAYS = 30`)

## API Endpoints

### POST `/api/newsletter/subscribe`

Subscribe a new email address.

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Confirmation email sent"
}
```

### GET `/api/newsletter/confirm?token=xxx`

Confirm email subscription.

**Response:** HTML page with confirmation status

## Data Format

### Subscriber Entry

```json
{
  "email": "user@example.com",
  "confirmed": true,
  "subscribeDate": "2026-02-10T12:00:00.000Z",
  "confirmDate": "2026-02-10T12:05:00.000Z",
  "source": "website"
}
```

### Newsletter Content

```typescript
{
  month: "February",
  year: "2026",
  summary: "AI-generated monthly summary",
  posts: [
    {
      title: "Post Title",
      url: "https://sergiocarracedo.es/blog/post-slug",
      description: "Post description",
      teaser: "AI-generated teaser",
      image: "https://sergiocarracedo.es/blog/post-slug/cover.png",
      date: "Feb 10, 2026"
    }
  ]
}
```

## Maintenance

### View Subscribers

```bash
cat subscribers/subscribers.json | jq '.[] | select(.confirmed == true)'
```

### Remove Subscriber

Edit `subscribers/subscribers.json` and remove the entry, then commit.

### Check Newsletter Logs

View logs in GitHub Actions or locally:

```bash
# Local test
node --loader ts-node/esm scripts/generate-newsletter.ts 30
```

## Troubleshooting

| Issue                 | Solution                                                      |
| --------------------- | ------------------------------------------------------------- |
| No confirmation email | Check Resend API key, verify domain                           |
| No posts found        | Check post dates, ensure not marked as `newsletterSent: true` |
| AI generation fails   | Verify Gemini API key, check rate limits                      |
| Subscriber not saved  | Check GitHub Actions logs, verify permissions                 |

See [NEWSLETTER_SETUP.md](./NEWSLETTER_SETUP.md) for detailed troubleshooting.

## Cost Breakdown

- **Resend**: Free for 3,000 emails/month (~100 subscribers)
- **Gemini**: Free tier (unlikely to exceed)
- **GitHub Actions**: Free for public repos

**Estimated cost:** $0/month for first 100 subscribers

## Security

- Double opt-in required
- Unsubscribe links in all emails
- API keys in GitHub Secrets
- HTTPS for all endpoints
- Email validation

## Contributing

To modify the newsletter system:

1. Test locally with `.env` file
2. Update scripts or templates
3. Test with `test_mode: true` in GitHub Actions
4. Deploy to production

## License

Part of sergiocarracedo.es - See main repository license.

## Support

- Resend: https://resend.com/docs
- Gemini: https://ai.google.dev/docs
- React Email: https://react.email/docs
- GitHub Actions: https://docs.github.com/actions

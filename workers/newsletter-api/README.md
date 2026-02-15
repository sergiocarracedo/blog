# Newsletter API Worker

Cloudflare Worker that handles newsletter subscriptions for sergiocarracedo.es.

## Endpoints

- `POST /subscribe` - Subscribe a new email (sends confirmation)
- `GET /confirm?token=xxx&email=xxx` - Confirm subscription
- `GET /health` - Health check

## Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Install dependencies

```bash
cd workers/newsletter-api
npm install
```

### 4. Set secrets

```bash
wrangler secret put RESEND_API_KEY
# Paste your Resend API key when prompted
```

### 5. Deploy

```bash
wrangler deploy
```

## Local Development

```bash
# Create a .dev.vars file with your secrets
echo "RESEND_API_KEY=re_your_key_here" > .dev.vars

# Run locally
wrangler dev
```

## Custom Domain (Optional)

After deploying, you can set up a custom domain like `api.sergiocarracedo.es`:

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select `newsletter-api`
3. Go to Settings > Triggers > Custom Domains
4. Add `api.sergiocarracedo.es`

Then update `wrangler.toml`:

```toml
routes = [
  { pattern = "api.sergiocarracedo.es/*", zone_name = "sergiocarracedo.es" }
]
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key (secret) |
| `SITE_URL` | Main site URL for redirects |
| `FROM_EMAIL` | Email sender address |
| `ALLOWED_ORIGIN` | CORS allowed origin |

## GitHub Actions

The worker is automatically deployed when changes are pushed to `workers/newsletter-api/` on the `main` branch.

Required secrets in GitHub:
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers permissions
- `RESEND_API_KEY` - Resend API key

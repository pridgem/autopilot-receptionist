# Autopilot Receptionist (MVP)

A productized “AI receptionist” for local service businesses.

**MVP scope (ship fast):**
- Landing page
- Stripe Checkout subscription
- Post-purchase onboarding form
- A simple web chat demo (lead capture + qualification)
- Admin view of leads (JSON file storage for v0)

**Next iteration:** SMS + calendar booking + CRM sync.

## Run locally

```bash
cp .env.example .env
npm run dev
```

## Environment

- `STRIPE_SECRET_KEY=...`
- `STRIPE_PRICE_ID=...` (recurring price)
- `APP_URL=http://localhost:3000` (or your deployed URL)
- `STRIPE_WEBHOOK_SECRET=...` (optional until you add webhooks)

## Files

- `server.js` — Express app
- `site/` — static landing + basic chat widget
- `data/leads.jsonl` — saved leads (one JSON per line)

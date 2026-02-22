import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const app = express();
const port = process.env.PORT || 3000;

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

app.use(express.static('site'));
app.use(express.json());

const LeadSchema = z.object({
  name: z.string().min(1).max(100),
  business: z.string().min(1).max(140),
  phone: z.string().min(7).max(40).optional().or(z.literal('')),
  email: z.string().email(),
  service: z.string().min(1).max(140),
  timeframe: z.string().min(1).max(80),
  notes: z.string().max(800).optional().or(z.literal('')),
});

const dataDir = path.join(process.cwd(), 'data');
const leadsPath = path.join(dataDir, 'leads.jsonl');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

app.post('/api/lead', (req, res) => {
  const parsed = LeadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const lead = { ...parsed.data, createdAt: new Date().toISOString() };
  fs.appendFileSync(leadsPath, JSON.stringify(lead) + '\n');
  return res.json({ ok: true });
});

app.get('/admin/leads', (req, res) => {
  // v0: no auth. Protect this route before real deployment.
  const lines = fs.existsSync(leadsPath) ? fs.readFileSync(leadsPath, 'utf8').trim().split(/\n+/).filter(Boolean) : [];
  const leads = lines.map(l => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
  res.setHeader('content-type', 'application/json');
  res.send(JSON.stringify({ count: leads.length, leads }, null, 2));
});

app.post('/api/stripe/checkout', async (req, res) => {
  if (!stripe) return res.status(500).json({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).' });
  const price = process.env.STRIPE_PRICE_ID;
  if (!price) return res.status(500).json({ error: 'Missing STRIPE_PRICE_ID.' });
  const appUrl = process.env.APP_URL || `http://localhost:${port}`;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price, quantity: 1 }],
    success_url: `${appUrl}/success.html`,
    cancel_url: `${appUrl}/` ,
    allow_promotion_codes: true,
  });

  res.json({ url: session.url });
});

app.listen(port, () => {
  console.log(`Autopilot Receptionist running on http://localhost:${port}`);
});

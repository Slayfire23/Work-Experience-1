const path = require('path');
const crypto = require('crypto');
const express = require('express');
const { sendToSupport } = require('./support');

const app = express();
const PORT = process.env.PORT || 3000;

const TIMING_SECRET =
  process.env.TIMING_SECRET || crypto.randomBytes(32).toString('hex');

function createTimingToken() {
  const timestamp = Date.now().toString();

  const signature = crypto
    .createHmac('sha256', TIMING_SECRET)
    .update(timestamp)
    .digest('hex');

  return `${timestamp}.${signature}`;
}

function isValidTimingToken(token) {
  if (typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;

  if (!/^\d+$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(signature)) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', TIMING_SECRET)
    .update(timestamp)
    .digest('hex');

  if (!crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )) {
    return false;
  }

  const elapsed = Date.now() - Number(timestamp);

  return elapsed >= 3000;
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

app.get('/contact-token', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ token: createTimingToken() });
});

app.post('/contact', (req, res) => {
  const website = String(req.body?.website ?? '').trim();

  // Silently reject submissions that fill the honeypot.
  if (website) {
    return res.json({ ok: true });
  }

  if (!isValidTimingToken(req.body?.timingToken)) {
    return res.json({ ok: true });
  }

  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim();
  const message = String(req.body?.message ?? '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({
      ok: false,
      error: 'Please fill in your name, email and message.',
    });
  }

  sendToSupport({ name, email, message });
  return res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Calico Media site running at http://localhost:${PORT}`);
});

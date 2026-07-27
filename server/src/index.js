require('dotenv').config();
const express = require('express');
const cors = require('cors');

require('./db'); // ensure tables exist on boot

const listingsRouter = require('./routes/listings');
const inquiriesRouter = require('./routes/inquiries');
const adminRouter = require('./routes/admin');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/listings', listingsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stats', statsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`AutoEdge Motors API listening on http://localhost:${PORT}`);
});

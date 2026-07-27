const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/stats - admin only, dashboard overview numbers
router.get('/', requireAdmin, (req, res) => {
  const activeListings = db.prepare(`SELECT COUNT(*) AS c FROM listings WHERE status = 'active'`).get().c;
  const soldListings = db.prepare(`SELECT COUNT(*) AS c FROM listings WHERE status = 'sold'`).get().c;
  const inquiriesThisWeek = db.prepare(`
    SELECT COUNT(*) AS c FROM inquiries WHERE created_at >= datetime('now', '-7 days')
  `).get().c;
  const unreadInquiries = db.prepare(`SELECT COUNT(*) AS c FROM inquiries WHERE is_read = 0`).get().c;

  res.json({ activeListings, soldListings, inquiriesThisWeek, unreadInquiries });
});

module.exports = router;

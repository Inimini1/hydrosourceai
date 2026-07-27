const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

function validate(body) {
  const errors = [];
  if (!body.buyerName || !body.buyerName.trim()) errors.push('Name is required.');
  if (!body.email || !body.email.trim()) errors.push('Email is required.');
  if (!body.message || !body.message.trim()) errors.push('Message is required.');
  return errors;
}

// POST /api/inquiries - public, submitted from contact forms / modal
router.post('/', (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const { listingId = null, buyerName, email, phone = '', message } = req.body;

  const result = db.prepare(`
    INSERT INTO inquiries (listing_id, buyer_name, email, phone, message)
    VALUES (@listingId, @buyerName, @email, @phone, @message)
  `).run({ listingId, buyerName, email, phone, message });

  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(row);
});

// GET /api/inquiries - admin only, full inbox with vehicle reference
router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT
      inquiries.*,
      listings.year AS vehicle_year,
      listings.make AS vehicle_make,
      listings.model AS vehicle_model
    FROM inquiries
    LEFT JOIN listings ON listings.id = inquiries.listing_id
    ORDER BY inquiries.created_at DESC
  `).all();

  res.json(rows);
});

// PATCH /api/inquiries/:id/read - admin only, toggle read/unread
router.patch('/:id/read', requireAdmin, (req, res) => {
  const { isRead } = req.body || {};
  const result = db.prepare('UPDATE inquiries SET is_read = ? WHERE id = ?')
    .run(isRead ? 1 : 0, req.params.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Inquiry not found.' });

  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id);
  res.json(row);
});

module.exports = router;

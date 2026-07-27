const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

function parseListing(row) {
  if (!row) return row;
  return { ...row, photos: JSON.parse(row.photos || '[]') };
}

const MAX_PHOTOS = 8;

function validateListingBody(body, { partial = false } = {}) {
  const errors = [];
  const fields = ['make', 'model', 'year', 'mileage', 'price'];

  if (!partial) {
    for (const f of fields) {
      if (body[f] === undefined || body[f] === null || body[f] === '') {
        errors.push(`${f} is required.`);
      }
    }
  }

  if (body.year !== undefined && (!Number.isInteger(Number(body.year)) || Number(body.year) < 1900)) {
    errors.push('year must be a valid integer.');
  }
  if (body.mileage !== undefined && (isNaN(Number(body.mileage)) || Number(body.mileage) < 0)) {
    errors.push('mileage must be a non-negative number.');
  }
  if (body.price !== undefined && (isNaN(Number(body.price)) || Number(body.price) < 0)) {
    errors.push('price must be a non-negative number.');
  }
  if (body.status !== undefined && !['active', 'sold'].includes(body.status)) {
    errors.push("status must be 'active' or 'sold'.");
  }
  if (body.photos !== undefined) {
    if (!Array.isArray(body.photos)) {
      errors.push('photos must be an array of URLs.');
    } else if (body.photos.length > MAX_PHOTOS) {
      errors.push(`photos may contain at most ${MAX_PHOTOS} URLs.`);
    }
  }

  return errors;
}

// GET /api/listings - public, filterable
router.get('/', (req, res) => {
  const { make, minPrice, maxPrice, minYear, maxYear, maxMileage, status, search } = req.query;

  const clauses = [];
  const params = {};

  if (status && status !== 'all') {
    clauses.push('status = @status');
    params.status = status;
  } else if (!status) {
    clauses.push("status = 'active'");
  }

  if (make) {
    clauses.push('make = @make');
    params.make = make;
  }
  if (minPrice) {
    clauses.push('price >= @minPrice');
    params.minPrice = Number(minPrice);
  }
  if (maxPrice) {
    clauses.push('price <= @maxPrice');
    params.maxPrice = Number(maxPrice);
  }
  if (minYear) {
    clauses.push('year >= @minYear');
    params.minYear = Number(minYear);
  }
  if (maxYear) {
    clauses.push('year <= @maxYear');
    params.maxYear = Number(maxYear);
  }
  if (maxMileage) {
    clauses.push('mileage <= @maxMileage');
    params.maxMileage = Number(maxMileage);
  }
  if (search) {
    clauses.push('(make LIKE @search OR model LIKE @search OR description LIKE @search)');
    params.search = `%${search}%`;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM listings ${where} ORDER BY created_at DESC`).all(params);

  res.json(rows.map(parseListing));
});

// GET /api/listings/makes - distinct makes for filter dropdown
router.get('/makes', (req, res) => {
  const rows = db.prepare(`SELECT DISTINCT make FROM listings ORDER BY make ASC`).all();
  res.json(rows.map((r) => r.make));
});

// GET /api/listings/:id - public
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Listing not found.' });
  res.json(parseListing(row));
});

// POST /api/listings - admin only
router.post('/', requireAdmin, (req, res) => {
  const errors = validateListingBody(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const { make, model, year, mileage, price, description = '', status = 'active', photos = [] } = req.body;

  const result = db.prepare(`
    INSERT INTO listings (make, model, year, mileage, price, description, status, photos)
    VALUES (@make, @model, @year, @mileage, @price, @description, @status, @photos)
  `).run({
    make, model,
    year: Number(year),
    mileage: Number(mileage),
    price: Number(price),
    description,
    status,
    photos: JSON.stringify(photos.slice(0, MAX_PHOTOS)),
  });

  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(parseListing(row));
});

// PUT /api/listings/:id - admin only
router.put('/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Listing not found.' });

  const errors = validateListingBody(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const merged = {
    make: req.body.make ?? existing.make,
    model: req.body.model ?? existing.model,
    year: req.body.year !== undefined ? Number(req.body.year) : existing.year,
    mileage: req.body.mileage !== undefined ? Number(req.body.mileage) : existing.mileage,
    price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
    description: req.body.description ?? existing.description,
    status: req.body.status ?? existing.status,
    photos: req.body.photos !== undefined
      ? JSON.stringify(req.body.photos.slice(0, MAX_PHOTOS))
      : existing.photos,
  };

  db.prepare(`
    UPDATE listings SET make=@make, model=@model, year=@year, mileage=@mileage,
      price=@price, description=@description, status=@status, photos=@photos
    WHERE id = @id
  `).run({ ...merged, id: req.params.id });

  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  res.json(parseListing(row));
});

// PATCH /api/listings/:id/status - admin only, quick active/sold toggle
router.patch('/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!['active', 'sold'].includes(status)) {
    return res.status(400).json({ error: "status must be 'active' or 'sold'." });
  }

  const result = db.prepare('UPDATE listings SET status = ? WHERE id = ?').run(status, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Listing not found.' });

  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  res.json(parseListing(row));
});

// DELETE /api/listings/:id - admin only
router.delete('/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM listings WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Listing not found.' });
  res.status(204).send();
});

module.exports = router;

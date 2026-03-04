const express = require('express');

const router = express.Router();

const CATEGORIES = ['Technology', 'Lifestyle', 'Travel', 'Food', 'Science'];

// GET /api/categories
router.get('/', (req, res) => {
  res.json({ categories: CATEGORIES });
});

module.exports = router;

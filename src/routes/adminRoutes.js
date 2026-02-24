const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/admin', ensureAuthenticated, ensureAdmin, adminController.dashboard);

module.exports = router;

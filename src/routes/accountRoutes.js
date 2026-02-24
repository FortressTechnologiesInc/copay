const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const accountController = require('../controllers/accountController');

router.get('/dashboard', ensureAuthenticated, accountController.dashboard);
router.post('/account/credit', ensureAuthenticated, accountController.credit);
router.post('/account/debit', ensureAuthenticated, accountController.debit);

module.exports = router;

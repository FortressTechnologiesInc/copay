const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

router.get('/transfers', ensureAuthenticated, transactionController.showTransfers);
router.post('/transfers', ensureAuthenticated, transactionController.transfer);
router.get('/transactions', ensureAuthenticated, transactionController.listTransactions);

module.exports = router;

const express = require('express');
const router = express.Router();
const apiAuth = require('../middleware/apiAuth');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login for mobile clients (returns JWT)
router.post('/api/v1/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Account summary
router.get('/api/v1/account', apiAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      fullName: req.user.full_name,
      email: req.user.email
    },
    account: req.account
  });
});

// Transactions
router.get('/api/v1/transactions', apiAuth, async (req, res) => {
  const transactions = await Transaction.findByAccountId(req.account.id, 100);
  res.json({ transactions });
});

// Transfer
router.post('/api/v1/transfers', apiAuth, async (req, res) => {
  try {
    const { recipientAccountNumber, amount, description } = req.body;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const fromAccount = req.account;
    if (amt > parseFloat(fromAccount.balance)) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    const toAccount = await Account.findByAccountNumber(recipientAccountNumber);
    if (!toAccount) {
      return res.status(404).json({ error: 'Recipient account not found' });
    }

    const newFromBalance = parseFloat(fromAccount.balance) - amt;
    const newToBalance = parseFloat(toAccount.balance) + amt;

    await Account.updateBalance(fromAccount.id, newFromBalance);
    await Account.updateBalance(toAccount.id, newToBalance);

    await Transaction.create({
      accountId: fromAccount.id,
      type: 'TRANSFER_OUT',
      amount: amt,
      description: description || `Transfer to ${toAccount.account_number}`
    });

    await Transaction.create({
      accountId: toAccount.id,
      type: 'TRANSFER_IN',
      amount: amt,
      description: description || `Transfer from ${fromAccount.account_number}`
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Transfer failed' });
  }
});

module.exports = router;

const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

module.exports = {
  async dashboard(req, res) {
    const account = req.account;
    const transactions = await Transaction.findByAccountId(account.id, 10);
    res.render('dashboard', {
      title: 'Dashboard - gr8pay',
      user: req.user,
      account,
      transactions
    });
  },

  async credit(req, res) {
    try {
      const { amount, description } = req.body;
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) {
        return res.redirect('/dashboard?error=Invalid+amount');
      }

      const account = req.account;
      const newBalance = parseFloat(account.balance) + amt;
      await Account.updateBalance(account.id, newBalance);
      await Transaction.create({
        accountId: account.id,
        type: 'CREDIT',
        amount: amt,
        description: description || 'Credit'
      });

      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      res.redirect('/dashboard?error=Credit+failed');
    }
  },

  async debit(req, res) {
    try {
      const { amount, description } = req.body;
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) {
        return res.redirect('/dashboard?error=Invalid+amount');
      }

      const account = req.account;
      if (amt > parseFloat(account.balance)) {
        return res.redirect('/dashboard?error=Insufficient+funds');
      }

      const newBalance = parseFloat(account.balance) - amt;
      await Account.updateBalance(account.id, newBalance);
      await Transaction.create({
        accountId: account.id,
        type: 'DEBIT',
        amount: amt,
        description: description || 'Debit'
      });

      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      res.redirect('/dashboard?error=Debit+failed');
    }
  }
};

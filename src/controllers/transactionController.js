const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

module.exports = {
  async showTransfers(req, res) {
    const accounts = await Account.findAllByUserId(req.user.id);
    res.render('transfers', {
      title: 'Transfers - gr8pay',
      user: req.user,
      account: req.account,
      accounts
    });
  },

  async transfer(req, res) {
    try {
      const { fromAccountId, recipientAccountNumber, amount, description } = req.body;
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) {
        return res.redirect('/transfers?error=Invalid+amount');
      }

      const userAccounts = await Account.findAllByUserId(req.user.id);
      const fromAccount = userAccounts.find(a => a.id === parseInt(fromAccountId, 10));
      if (!fromAccount) {
        return res.redirect('/transfers?error=Invalid+source+account');
      }

      if (amt > parseFloat(fromAccount.balance)) {
        return res.redirect('/transfers?error=Insufficient+funds');
      }

      const toAccount = await Account.findByAccountNumber(recipientAccountNumber);
      if (!toAccount) {
        return res.redirect('/transfers?error=Recipient+account+not+found');
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

      res.redirect('/transfers?success=Transfer+completed');
    } catch (err) {
      console.error(err);
      res.redirect('/transfers?error=Transfer+failed');
    }
  },

  async listTransactions(req, res) {
    const account = req.account;
    const transactions = await Transaction.findByAccountId(account.id, 100);
    res.render('transactions', {
      title: 'Transactions - gr8pay',
      user: req.user,
      account,
      transactions
    });
  }
};

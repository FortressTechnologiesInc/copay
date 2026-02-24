const db = require('../config/db');

module.exports = {
  async dashboard(req, res) {
    const [[{ userCount }]] = await db.query('SELECT COUNT(*) AS userCount FROM users');
    const [[{ accountCount }]] = await db.query('SELECT COUNT(*) AS accountCount FROM accounts');
    const [[{ txCount }]] = await db.query('SELECT COUNT(*) AS txCount FROM transactions');
    const [recentTx] = await db.query(
      'SELECT t.*, a.account_number FROM transactions t JOIN accounts a ON t.account_id = a.id ORDER BY t.created_at DESC LIMIT 20'
    );

    res.render('admin-dashboard', {
      title: 'Admin - gr8pay',
      user: req.user,
      stats: { userCount, accountCount, txCount },
      recentTx
    });
  }
};

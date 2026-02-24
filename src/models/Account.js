const db = require('../config/db');

module.exports = {
  async findByUserId(userId) {
    const [rows] = await db.query('SELECT * FROM accounts WHERE user_id = ?', [userId]);
    return rows[0] || null;
  },

  async findAllByUserId(userId) {
    const [rows] = await db.query('SELECT * FROM accounts WHERE user_id = ?', [userId]);
    return rows;
  },

  async findByAccountNumber(accountNumber) {
    const [rows] = await db.query('SELECT * FROM accounts WHERE account_number = ?', [accountNumber]);
    return rows[0] || null;
  },

  async createForUser(userId) {
    const accountNumber = 'GR8-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const [result] = await db.query(
      'INSERT INTO accounts (user_id, account_number, balance) VALUES (?, ?, 0.00)',
      [userId, accountNumber]
    );
    const [rows] = await db.query('SELECT * FROM accounts WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  async updateBalance(accountId, newBalance) {
    await db.query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);
  }
};

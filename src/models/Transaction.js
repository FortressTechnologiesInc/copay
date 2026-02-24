const db = require('../config/db');

module.exports = {
  async create({ accountId, type, amount, description }) {
    await db.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES (?, ?, ?, ?)',
      [accountId, type, amount, description || null]
    );
  },

  async findByAccountId(accountId, limit = 50) {
    const [rows] = await db.query(
      'SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC LIMIT ?',
      [accountId, limit]
    );
    return rows;
  }
};

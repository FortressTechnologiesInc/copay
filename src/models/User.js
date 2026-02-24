const db = require('../config/db');

module.exports = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ email, passwordHash, fullName, isAdmin = 0 }) {
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, full_name, is_admin) VALUES (?, ?, ?, ?)',
      [email, passwordHash, fullName, isAdmin]
    );
    return this.findById(result.insertId);
  }
};

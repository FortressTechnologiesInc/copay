const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');

module.exports = async function apiAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const account = await Account.findByUserId(user.id);
    req.user = user;
    req.account = account;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

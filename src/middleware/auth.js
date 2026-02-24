const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');

module.exports = {
  ensureAuthenticated: async (req, res, next) => {
    try {
      const token = req.session && req.session.token;
      if (!token) return res.redirect('/login');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.redirect('/login');

      const account = await Account.findByUserId(user.id);
      req.user = user;
      req.account = account;
      next();
    } catch (err) {
      console.error(err);
      return res.redirect('/login');
    }
  },

  ensureAdmin: (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).send('Forbidden');
    }
    next();
  }
};

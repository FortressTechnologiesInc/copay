const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');

module.exports = {
  showLogin(req, res) {
    res.render('login', { title: 'Login - gr8pay', error: null });
  },

  showRegister(req, res) {
    res.render('register', { title: 'Register - gr8pay', error: null });
  },

  async register(req, res) {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password || !fullName) {
        return res.render('register', { title: 'Register - gr8pay', error: 'All fields are required.' });
      }

      const existing = await User.findByEmail(email);
      if (existing) {
        return res.render('register', { title: 'Register - gr8pay', error: 'Email already registered.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ email, passwordHash, fullName });
      await Account.createForUser(user.id);

      return res.redirect('/login');
    } catch (err) {
      console.error(err);
      return res.render('register', { title: 'Register - gr8pay', error: 'Registration failed.' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmail(email);
      if (!user) {
        return res.render('login', { title: 'Login - gr8pay', error: 'Invalid credentials.' });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.render('login', { title: 'Login - gr8pay', error: 'Invalid credentials.' });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
      req.session.token = token;

      return res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      return res.render('login', { title: 'Login - gr8pay', error: 'Login failed.' });
    }
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
};

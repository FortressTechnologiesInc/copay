const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000
    }
  })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);
app.use('/', accountRoutes);
app.use('/', transactionRoutes);
app.use('/', adminRoutes);
app.use('/', apiRoutes);

app.get('/', (req, res) => {
  if (req.session && req.session.token) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`gr8pay LLC fintech app running on port ${PORT}`);
});

const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('../models/User');

const { validateId } = require('../middlewares/authorization');

router.get('/login', passport.authenticate('local'));

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/api/login', failureFlash: true }),
  (req, res) => {
    delete req.session.flash;
    return res.redirect('/api');
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/api');
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'signup' });
});

router.post('/signup', validateId, async (req, res) => {
  await User.create({ 
    ...req.body,
    passwordHash: bcrypt.hashSync(req.body.password, Number(process.env.BCRYPT_SALT_ROUNDS))
  });

  res.json({ "result": "ok" });
  return res.redirect('/api/login')
});

module.exports = router;

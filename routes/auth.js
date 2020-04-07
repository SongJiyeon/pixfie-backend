const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('../models/User');

const { validateId } = require('../middlewares/authorization');

router.get('/login', passport.authenticate('local'));

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/api/login', failureFlash: true }),
  async (req, res) => {
    delete req.session.flash;
    const user = await User.findById(req.session.passport.user);
    return res.json(user);
});

router.get('/logout', (req, res) => {
  req.logout();
  console.log(req.isAuthenticated());
  return res.json({ "result": "ok" });
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'signup' });
});

router.post('/signup', validateId, async (req, res) => {
  await User.create({ 
    ...req.body,
    passwordHash: bcrypt.hashSync(req.body.password, Number(process.env.BCRYPT_SALT_ROUNDS))
  });
  return res.json({ "result": "ok" });
});

module.exports = router;

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  console.log(req.isAuthenticated());
  res.render('index', { title: 'Express', loggedIn: req.isAuthenticated() });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'login' });
});

module.exports = router;

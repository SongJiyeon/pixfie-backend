const express = require('express');
const router = express.Router();
const _ = require('lodash');

const User = require('../models/User');

router.get('/search', async (req, res) => {
  const usersById = await User.find({ user_id: { $regex : `.*${req.query.keyword}.*` } });
  const usersByName = await User.find({ user_name: { $regex : `.*${req.query.keyword}.*` } });

  return res.json(_.uniqWith([...usersById, ...usersByName], _.isEqual));
});

router.get('/:_id', async (req, res) => {
  const userById = await User.findById(req.params._id);
  return res.json(userById);
});

module.exports = router;

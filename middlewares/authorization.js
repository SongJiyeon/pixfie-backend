const User = require('../models/User');

const validateId = async (req, res, next) => {
  try {
    const user = await User.findOne({ user_id: req.body.user_id });

    if (user) {
      return res.json({ "error": "already signed" });
    }

    next();
  } catch (error) {
    next({
      status: 500,
      message: 'Internal Server Error'
    });
  }
};

module.exports = {
  validateId
};

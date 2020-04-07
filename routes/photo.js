const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer();


router.post('/', upload.fields([{ name: 'photo'}]), (req, res, next) => {
  try {
    console.log(req.files.photo[0].buffer);
    res.json({ 'result': 'ok' });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;

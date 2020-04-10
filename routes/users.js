const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const AWS = require('aws-sdk');
const _ = require('lodash');

const upload = multer();

const User = require('../models/User');

const s3 = new AWS.S3({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
});

router.get('/search', async (req, res) => {
  const usersById = await User.find({ user_id: { $regex : `.*${req.query.keyword}.*` } });
  const usersByName = await User.find({ user_name: { $regex : `.*${req.query.keyword}.*` } });

  return res.json(_.uniqWith([...usersById, ...usersByName], _.isEqual));
});

router.get('/:_id', async (req, res) => {
  const userById = await User.findById(req.params._id);
  return res.json(userById);
});

router.get('/:_id/photos', async (req, res, next) => {
  console.log(req.params._id);
  res.json({ "result": "ok" });
});

router.post('/:_id/photos', upload.fields([{ name: 'photo'}]), async (req, res, next) => {
  try {
    const date = Date.now().toString();

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `photos/${req.params._id}_${date}`,
      Body: req.files.photo[0].buffer,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/jpg`
    };

    s3.upload(params, async (error, data) => {
      if (error) {
        throw new Error('s3 upload failed');
      } else {
        console.log('Upload Success', data.Location);

        axios({
          method: 'post',
          url: 'https://kapi.kakao.com/v1/vision/face/detect',
          data: 'image_url=' + data.Location,
          headers: {
            Authorization: process.env.KAKAO_APP_KEY
          }
        })
        .then(response => {
          console.log(response.data.result.faces);
          res.json(response.data.result.faces[0]);
        })
        .catch(error => {
          console.log('error', error);
          next(error);
        });
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const AWS = require('aws-sdk');
const _ = require('lodash');

const upload = multer();

const User = require('../models/User');
const Photo = require('../models/Photo');

const s3 = new AWS.S3({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
});

router.put('/follow', async (req, res, next) => {
  const { user_id, followee_id } = req.body;

  await User.findByIdAndUpdate(followee_id, { $push: { followers: user_id } });
  await User.findByIdAndUpdate(user_id, { $push: { followings: followee_id } });

  return res.json({ "result": "ok" });
});

router.put('/unfollow', async (req, res, next) => {
  const { user_id, followee_id } = req.body;

  await User.findByIdAndUpdate(followee_id, { $pull: { followers: user_id } });
  await User.findByIdAndUpdate(user_id, { $pull: { followings: followee_id } });

  return res.json({ "result": "ok" });
});

router.get('/:_id', async (req, res) => {
  const user = await User.findById(req.params._id);
  const photos = await Photo.find({ _id: { $in: user.photos } });
  return res.json({ user, photos });
});

router.get('/:user_id/search', async (req, res) => {
  const usersById = await User.find({ user_id: { $regex: `.*${req.query.keyword}.*`, $nin: [req.params.user_id] } });
  const usersByName = await User.find({ user_name: { $regex: `.*${req.query.keyword}.*` } });

  return res.json(_.uniqWith([...usersById, ...usersByName], _.isEqual));
});

router.get('/:_id/photos', async (req, res, next) => {
  const user = await User.findById(req.params._id);
  const photos = await Photo.find({ _id: { $in: user.photos } });
  return res.json({ photos });
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

router.post('/:_id/portraits', upload.fields([{ name: 'photo'}]), async (req, res, next) => {
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

        const photo = await Photo.create({
          image_url: data.Location,
          date,
        });
        await User.findByIdAndUpdate(req.params._id, { $push: { photos: photo._id } });
        return res.json({ "result": "ok" });
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete('/:_id/portraits', async (req, res, next) => {
  const { portrait_id } = req.body;

  await User.findByIdAndUpdate(req.params._id, { $pull: { photos: portrait_id } });
  await Photo.findByIdAndDelete(portrait_id);

  const user = await User.findById(req.params._id);
  const photos = await Photo.find({ _id: { $in: user.photos } });
  console.log(photos);

  return res.json({ photos });
});

router.put('/:_id/like/:portrait_id', async (req, res, next) => {
  await Photo.findByIdAndUpdate(req.params.portrait_id, { $push: { like_users: req.params._id } });

  const user = await User.findById(req.body.owner_id);
  const photos = await Photo.find({ _id: { $in: user.photos } });

  return res.json({ photos });
});

router.put('/:_id/unlike/:portrait_id', async (req, res, next) => {
  await Photo.findByIdAndUpdate(req.params.portrait_id, { $pull: { like_users: req.params._id } });

  const user = await User.findById(req.body.owner_id);
  const photos = await Photo.find({ _id: { $in: user.photos } });

  return res.json({ photos });
});

module.exports = router;

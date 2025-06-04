/**
 * @file img.js
 * @description public 폴더 참조하여 이미지 전송.
 * @module routes/img
 *
 * This module sets up an Express router to handle GET requests for images.
 * It validates the image ID, retrieves the corresponding image name from
 * environment variables, and serves the image file from the public directory.
 *
 * Environment Variables:
 * - IMAGE_ALARM_<id>: The name of the image file corresponding to the given ID.
 *
 * Routes:
 * - GET /:id - Serves the image file corresponding to the given ID.
 *
 * @requires express
 * @requires path
 * @requires dotenv
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id < 1 || id > 16) {
    return res.status(400).send('Invalid image ID');
  }

  var images =[
    "n1.png",
    "n2.png",
    "n3.png",
    "n4.png",
    "n5.png",
    "n6.png",
    "n7.png",
    "n8.png",
    "n9.png",
    "n10.png",
    "n11.png",
    "n12.png",
    "n13.png",
    "n14.png",
    "n15.png",
    "n16.png"
];
console.log(imagePath)

  const imageName = images[id];
  if (!imageName) {
    return res.status(404).send('Image not found');
  }
  console.log(imagePath)
  res.send(imagePath);
  const imagePath = path.join(__dirname, '../../public/images', imageName);
  res.sendFile(imagePath);
});

module.exports = router;

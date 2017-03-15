/*jshint esversion: 6 */
const express = require('express');
const router = express.Router();
const pg = require('pg');
const config = require('../modules/pg-config');
const app = express();

const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const albumBucketName = 'photo-app-aws';
const href = 'https://s3.amazonaws.com/';
const bucketUrl = href + albumBucketName + '/';

/*******************
SET AWS CREDENTIALS
********************/
AWS.config.update({
    secretAccessKey: process.env.AWSSecretKey,
    accessKeyId: process.env.AWSAccessKeyId
});

AWS.config.apiVersions = {
    s3: '2006-03-01',
};

const s3 = new AWS.S3();

router.get("/:albumName", function(req, res) {
    let albumPhotosKey = encodeURIComponent(req.params.albumName) + '//';
    let params = {
        Bucket: albumBucketName,
        Prefix: albumPhotosKey
    };
    s3.listObjects(params, function(err, data) {
        if (err) {
            console.log('There was an error viewing your album: ', err, err.stack); // an error occurred
            res.sendStatus(402);
        }
        let href = this.request.httpRequest.endpoint.href;
        let bucketUrl = href + albumBucketName + '/';
        let photos = data.Contents.map(function(photo) {
            let photoKey = photo.Key;
            let photoUrl = bucketUrl + encodeURIComponent(photoKey);
            return (photoUrl);
        });
        res.send(photos);
    });
});

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: albumBucketName,
        key: function(req, file, cb) {
            let fullFileName = req.params.albumName + '//' + file.originalname;
            // console.log('fullFileName:', fullFileName);
            cb(null, fullFileName);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read'
    })
});

router.post('/:albumName', upload.array('file', 1), function(req, res, next) {
    // console.log('req.file:', req.files);
    // console.log('req.body:', req.body);
    // console.log('req.params:', req.params.albumName);
    res.send("Uploaded!");
});

router.delete("/:photo", function(req, res) {
    let photo = req.params.photo;
    let photoUrl = bucketUrl + encodeURIComponent(photo);
    console.log('photo', photo);
    let params = {
        Bucket: albumBucketName,
        Key: photo
    }
    s3.deleteObject(params, function(err, data) {
        if (err) {
            console.log('There was an error deleting your photo: ', err.message);
            res.sendStatus(400);
        }
        console.log('Successfully deleted photo.');
        res.sendStatus(200);
    });

});

module.exports = router;
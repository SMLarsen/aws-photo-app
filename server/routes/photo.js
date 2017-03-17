/*jshint esversion: 6 */
const express = require('express');
const router = express.Router();
const pg = require('pg');
const config = require('../modules/pg-config');
const app = express();
const shortid = require('shortid');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const albumBucketName = 'photo-app-aws';
const href = 'https://s3.amazonaws.com/';
const bucketUrl = href + albumBucketName + '/';

const pool = new pg.Pool(config.pg);

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

let photo = {};
let photos = [];

router.get("/:albumID/:albumS3ID", function(req, res, next) {
    pool.query('SELECT * FROM photo WHERE album_id = $1', [req.params.id], function(err, result) {
        if (err) {
            console.log('Error getting album', err);
            res.sendStatus(500);
        } else {
            photos = result.rows;
            console.log("photos", photos);
            next();
        }
    });
});

router.get("/:albumID/:albumS3ID", function(req, res) {
    let params = {
        Bucket: albumBucketName,
        Prefix: req.params.albumS3ID
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
            photo.name = file.originalname;
            photo.s3Name = encodeURIComponent(req.params.albumS3Name + '//' + shortid.generate() + '_' + file.originalname);
            cb(null, photo.s3Name);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read'
    })
});

router.post('/:albumS3Name', upload.array('file', 1), function(req, res, next) {
    photo.albumID = req.body.albumID;
    photo.name = req.body.originalname;
    photo.caption = req.body.caption;
    next();
});

router.post("/:albumS3Name", function(req, res, next) {
    pool.query('INSERT INTO photo (album_id, name, s3_name, caption) VALUES ($1, $2, $3, $4) RETURNING *', [photo.albumID, photo.name, photo.s3Name, photo.caption], function(err, result) {
        if (err) {
            console.log('Error inserting album', err);
            res.sendStatus(500);
        }
        res.send(result.rows[0]);
    });
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
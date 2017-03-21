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
    pool.query('SELECT * FROM photo WHERE album_id = $1', [req.params.albumID], function(err, result) {
        if (err) {
            console.log('Error getting album', err);
            res.sendStatus(500);
        } else {
            photos = result.rows;
            photos = photos.map(function(s3Photo) {
                s3Photo.photoUrl = bucketUrl + s3Photo.s3_name;
                return (s3Photo);
            });
            res.send(photos);
        }
    });
});

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: albumBucketName,
        key: function(req, file, cb) {
            // photo.albumID = file.albumID;
            photo.name = file.originalname;
            // photo.caption = file.caption;
            // photo.coverPhoto = file.coverPhoto;
            photo.s3Name = req.params.albumS3Name + 'x/' + shortid.generate() + '_' + file.originalname;
            cb(null, photo.s3Name);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read'
    })
});

router.post('/:albumS3Name', upload.array('file', 1), function(req, res, next) {
    console.log('req.body', req.body);
    next();
});

router.post("/:albumS3Name", function(req, res, next) {
    pool.query('INSERT INTO photo (album_id, name, s3_name, caption) VALUES ($1, $2, $3, $4) RETURNING *', [req.body.albumID, photo.name, photo.s3Name, req.body.caption], function(err, result) {
        if (err) {
            console.log('Error inserting album', err);
            res.sendStatus(500);
        } else {
            if (req.body.coverPhoto === 'true') {
                photo.coverPhotoURL = bucketUrl + photo.s3Name;
                pool.query('UPDATE album SET cover_photo = $1 WHERE id = $2 RETURNING *', [photo.coverPhotoURL, req.body.albumID], function(err, result) {
                    if (err) {
                        console.log('Error updating album with cover photo', err);
                        res.sendStatus(500);
                    }
                    console.log('result.rows', result.rows);
                    res.send(result.rows[0]);
                });
            };
        }
    });
});

router.delete("/:photoID", function(req, res, next) {
    console.log("photo delete");
    pool.query('DELETE FROM photo WHERE id = $1 RETURNING *', [req.params.photoID], function(err, result) {
        if (err) {
            console.log('Error deleting photo', err);
            res.sendStatus(500);
        } else {
            photo = result.rows[0];
            next();
        }
    });
});

router.delete("/:photoID", function(req, res) {
    console.log('Deleting from S3:', photo.s3_name);
    let params = {
        Bucket: albumBucketName,
        Key: photo.s3_name
    }
    s3.deleteObject(params, function(err, data) {
        if (err) {
            console.log('There was an error deleting your photo: ', err.message);
            res.sendStatus(400);
        }
        res.sendStatus(200);
    });

});

module.exports = router;
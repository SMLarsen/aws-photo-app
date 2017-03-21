/*jshint esversion: 6 */
const express = require('express');
const router = express.Router();
const pg = require('pg');
const config = require('../modules/pg-config');
const AWS = require('aws-sdk');
const shortid = require('shortid');

let album = {};

const pool = new pg.Pool(config.pg);

AWS.config.update({
    secretAccessKey: process.env.AWSSecretKey,
    accessKeyId: process.env.AWSAccessKeyId
});

AWS.config.apiVersions = {
    s3: '2006-03-01',
};

const s3 = new AWS.S3();
let s3Name = '';

router.get("/", function(req, res, next) {
    pool.query('SELECT id, name, s3_name, cover_photo FROM album', function(err, result) {
        if (err) {
            console.log('Error getting album', err);
            res.sendStatus(500);
        } else {
            res.send(result.rows);
        }
    });
});

router.get("/:id", function(req, res, next) {
    pool.query('SELECT album.id, album.name, album.s3_name AS album_s3_name, album.cover_photo, photo.s3_name AS photo_s3_name FROM album LEFT OUTER JOIN photo ON photo.album_id = album.id WHERE album.id = $1', [req.params.id], function(err, result) {
        if (err) {
            console.log('Error getting album', err);
            res.sendStatus(500);
        } else {
            res.send(result.rows[0]);
        }
    });
});

router.post("/", function(req, res, next) {
    let s3Name = shortid.generate() + '_' + req.body.albumName;
    pool.query('INSERT INTO album (name, s3_name) VALUES ($1, $2) RETURNING *', [req.body.albumName, s3Name], function(err, result) {
        if (err) {
            console.log('Error inserting album', err);
            res.sendStatus(500);
        } else {
            album = result.rows[0];
            next();
        }
    });
});

router.post("/", function(req, res) {
    let albumKey = album.s3_name + '/';
    let params = {
        Bucket: 'photo-app-aws',
        Key: albumKey
    };
    s3.headObject(params, function(err, data, next) {
        if (!err) {
            console.log('ERROR: The album has already been created.')
            res.sendStatus(302);
        }
        if (err.code !== 'NotFound') {
            console.log('ERROR: There was an error creating your album: ' + err.message);
            res.sendStatus(500);
        }
        s3.putObject(params, function(err, data) {
            if (err) {
                console.log('ERROR: There was an error creating your album: ' + err.message);
                res.sendStatus(500);
            }
            res.send(album);
        });
    });
});

router.delete("/:albumID", function(req, res, next) {
    pool.query('DELETE FROM album WHERE id = $1 RETURNING *', [req.params.albumID], function(err, result) {
        if (err) {
            console.log('Error deleting album', err);
            res.sendStatus(500);
        } else {
            album = result.rows[0];
            next();
        }
    });
});

router.delete("/:albumID", function(req, res, next) {
    var albumKey = album.s3_name + '/';
    s3.listObjects({
        Prefix: albumKey,
        Bucket: 'photo-app-aws'
    }, function(err, data) {
        if (err) {
            console.log('There was an error deleting your album: ', err.message);
            res.send(400);
        }
        var objects = data.Contents.map(function(object) {
            return { Key: object.Key };
        });
        s3.deleteObjects({
            Bucket: 'photo-app-aws',
            Delete: {
                Objects: objects,
                Quiet: true
            }
        }, function(err, data) {
            if (err) {
                console.log('There was an error deleting your album: ', err.message);
                res.send(400);
            }
            res.send(200);
        });
    });
});

module.exports = router;
/*jshint esversion: 6 */
const express = require('express');
const router = express.Router();
const pg = require('pg');
const config = require('../modules/pg-config');
const AWS = require('aws-sdk');
const shortid = require('shortid');


console.log('here i am');
const pool = new pg.Pool(config.pg);
console.log(pool);

AWS.config.update({
    secretAccessKey: process.env.AWSSecretKey,
    accessKeyId: process.env.AWSAccessKeyId
});

AWS.config.apiVersions = {
    s3: '2006-03-01',
};

const s3 = new AWS.S3();
let s3Name = '';

router.get("/", function(req, res) {
    let params = {
        Bucket: 'photo-app-aws',
        Delimiter: '/'
    };
    s3.listObjects(params, function(err, data) {
        if (err) {
            console.log('There was an error listing your albums: ', err, err.stack); // an error occurred
            res.sendStatus(402);
        } else {
            let albums = data.CommonPrefixes.map(function(commonPrefix) {
                let prefix = commonPrefix.Prefix;
                let albumName = decodeURIComponent(prefix.replace('/', ''));
                return albumName;
            });
            res.send(albums);
        }
    });
});

router.post("/", function(req, res, next) {
    console.log('req.body:', req.body);
    let s3Name = shortid.generate() + '_' + req.body.albumName;
    console.log('s3Name:', s3Name);
    pool.query('INSERT INTO album (name, s3_name) VALUES ($1, $2)', [req.body.albumName, s3Name], function(err, result) {
        if (err) {
            console.log('Error inserting album', err);
            res.sendStatus(500);
        } else {
            next();
        }
    });
});

router.post("/", function(req, res) {
    let albumKey = encodeURIComponent(req.body.albumName) + '/';
    console.log('albumKey:', albumKey);
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
            console.log('Successfully created album.');
            res.sendStatus(201);
        });
    });
});




router.delete("/:albumName", function(req, res) {
    var albumKey = encodeURIComponent(req.params.albumName) + '/';
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
            console.log('Successfully deleted album.');
            res.send(200);
        });
    });
});

module.exports = router;
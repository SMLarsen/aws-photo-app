/*jshint esversion: 6 */
const express = require('express');
const router = express.Router();
const pg = require('pg');
const config = require('../modules/pg-config');
const AWS = require('aws-sdk');

AWS.config.update({
    secretAccessKey: process.env.AWSSecretKey,
    accessKeyId: process.env.AWSAccessKeyId
});

AWS.config.apiVersions = {
    s3: '2006-03-01',
};

const s3 = new AWS.S3();

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

router.post("/", function(req, res) {
    let albumKey = encodeURIComponent(req.body.albumName) + '/';
    let params = {
        Bucket: 'photo-app-aws',
        Key: albumKey
    };
    s3.headObject(params, function(err, data) {
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
            res.sendStatus(200);
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
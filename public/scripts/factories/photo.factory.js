/*jshint esversion: 6 */
app.factory("PhotoFactory", function($http) {
    console.log('PhotoFactory started');

    const albumBucketName = 'photo-app-aws';
    const bucketRegion = 'us-east-1';
    const IdentityPoolId = 'us-east-1:3f84d793-7a2a-4d80-ade0-1c5f223e68ca';

    let photoData = {
        albums: [],
        photos: [],
    };

    AWS.config.update({});

    let s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {
            Bucket: albumBucketName
        }
    });

    function listAlbums() {
        let listObjectsPromise = s3.listObjects({
                Delimiter: '/'
            })
            .promise();
        return listObjectsPromise
            .then(function(data) {
                photoData.albums = data.CommonPrefixes.map(function(commonPrefix) {
                    let prefix = commonPrefix.Prefix;
                    let albumName = decodeURIComponent(prefix.replace('/', ''));
                    return albumName;
                });
                console.log('albums', photoData.albums);
                return;
            })
            .catch((err) => console.log('There was an error listing your albums: ' + err.message));
    }

    function createAlbum(albumName) {
        console.log('factory create album:', albumName);
        let albumKey = encodeURIComponent(albumName) + '/';
        return s3.headObject({
            Key: albumKey
        }, function(err, data) {
            if (!err) {
                return alert('Album already exists.');
            }
            if (err.code !== 'NotFound') {
                return alert('There was an error creating your album: ' + err.message);
            }
            s3.putObject({
                Key: albumKey
            }, function(err, data) {
                if (err) {
                    return alert('There was an error creating your album: ' + err.message);
                }
                alert('Successfully created album.');
                return;
            });
        });
    }

    function deleteAlbum(albumName) {
        let albumKey = encodeURIComponent(albumName) + '/';
        s3.listObjects({
            Prefix: albumKey
        }, function(err, data) {
            if (err) {
                return alert('There was an error deleting your album: ', err.message);
            }
            let objects = data.Contents.map(function(object) {
                return {
                    Key: object.Key
                };
            });
            return s3.deleteObjects({
                Delete: {
                    Objects: objects,
                    Quiet: true
                }
            }, function(err, data) {
                if (err) {
                    return alert('There was an error deleting your album: ', err.message);
                }
                alert('Successfully deleted album.');
                return;
            });
        });
    }

    let publicApi = {
        data: photoData,
        listAlbums: function() {
            return listAlbums();
        },
        createAlbum: function(albumName) {
            return createAlbum(albumName);
        },
        deleteAlbum: function(albumName) {
            return deleteAlbum(albumName);
        },
        checkForAlbumDup: function(albumName) {
            return checkForAlbumDup(albumName);
        }
    };

    return publicApi;

}); // END: PhotoFactory
/*jshint esversion: 6 */
angular.module('app').controller('AlbumController', ['$http', '$scope', '$mdDialog', function($http, $scope, $mdDialog) {
    console.log("Album Controller Started");
    let self = this;
    // self.albums = [1, 2, 3];

    var albumBucketName = 'photo-app-aws';
    var bucketRegion = 'us-east-1';
    var IdentityPoolId = 'us-east-1:3f84d793-7a2a-4d80-ade0-1c5f223e68ca';

    AWS.config.update({});

    var s3 = new AWS.S3({
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
        listObjectsPromise
            .then(function(data) {
                self.albums = data.CommonPrefixes.map(function(commonPrefix) {
                    var prefix = commonPrefix.Prefix;
                    var albumName = decodeURIComponent(prefix.replace('/', ''));
                    return albumName;
                });
                console.log('albums', self.albums);
                $scope.$apply();
            })
            .catch(function(err) {
                return alert('There was an error listing your albums: ' + err.message);
            });
    }

    listAlbums();

    function createAlbum(albumName) {
        console.log('create album:', albumName);
        albumName = albumName.trim();
        if (!albumName) {
            return alert('Album names must contain at least one non-space character.');
        }
        if (albumName.indexOf('/') !== -1) {
            return alert('Album names cannot contain slashes.');
        }
        var albumKey = encodeURIComponent(albumName) + '/';
        s3.headObject({
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
                viewAlbum(albumName);
            });
        });
    }

    function viewAlbum(albumName) {
        console.log('view ', albumName);
        window.location = '#!/photo/' + albumName;
    }

    self.deleteAlbum = function(albumName) {
        var albumKey = encodeURIComponent(albumName) + '/';
        s3.listObjects({
            Prefix: albumKey
        }, function(err, data) {
            if (err) {
                return alert('There was an error deleting your album: ', err.message);
            }
            var objects = data.Contents.map(function(object) {
                return {
                    Key: object.Key
                };
            });
            s3.deleteObjects({
                Delete: {
                    Objects: objects,
                    Quiet: true
                }
            }, function(err, data) {
                if (err) {
                    return alert('There was an error deleting your album: ', err.message);
                }
                alert('Successfully deleted album.');
                listAlbums();
            });
        });
    }

    self.showPrompt = function(ev) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.prompt()
            .title('Create Album')
            .textContent('What is the name of the album to create?')
            .placeholder('Album name')
            .ariaLabel('Album name')
            // .initialValue('Buddy')
            .targetEvent(ev)
            .ok('Create')
            .cancel('Discard');

        $mdDialog.show(confirm)
            .then(function(result) {
                createAlbum(result);
                self.status = 'Album to be created will be: ' + result + '.';
            }, function() {
                self.status = 'Enter an album name.';
            });
    };


}]);
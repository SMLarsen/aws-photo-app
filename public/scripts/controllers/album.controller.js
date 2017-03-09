/*jshint esversion: 6 */
angular.module('app').controller('AlbumController', ['$http', '$scope', '$mdDialog', 'PhotoFactory', function($http, $scope, $mdDialog, PhotoFactory) {
    console.log("Album Controller Started");

    const photoFactory = PhotoFactory;

    let self = this;
    self.data = photoFactory.data;

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
        console.log('List Albums');
        photoFactory.listAlbums()
            .then(function(response) {
                console.log('album data from controller:', self.data);
                $scope.$apply();
            })
            .catch(function(err) {
                alert('There was an error listing your albums: ' + err.message);
            });
    }

    listAlbums();

    function createAlbum(albumName) {
        console.log('create album AlbumController:', albumName);
        albumName = albumName.trim();
        if (!albumName) {
            return alert('Album names must contain at least one non-space character.');
        }
        if (albumName.indexOf('/') !== -1) {
            return alert('Album names cannot contain slashes.');
        }
        photoFactory.createAlbum(albumName);
        listAlbums();
        viewAlbum(albumName);
    }

    function viewAlbum(albumName) {
        console.log('view ', albumName);
        window.location = '#!/photo/' + albumName;
    }

    self.deleteAlbum = function(albumName) {
        photoFactory.deleteAlbum(albumName);
        listAlbums();
        console.log('albums', self.data.albums);
        // window.location.reload();
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
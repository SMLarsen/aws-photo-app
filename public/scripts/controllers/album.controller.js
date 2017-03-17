/*jshint esversion: 6 */
angular.module('app').controller('AlbumController', ['$scope', '$window', '$mdDialog', 'PhotoFactory', function($scope, $window, $mdDialog, PhotoFactory) {
    console.log("Album Controller Started");

    const photoFactory = PhotoFactory;

    let self = this;
    self.data = photoFactory.data;

    var albumBucketName = 'photo-app-aws';
    var bucketRegion = 'us-east-1';
    var IdentityPoolId = 'us-east-1:3f84d793-7a2a-4d80-ade0-1c5f223e68ca';

    var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {
            Bucket: albumBucketName
        }
    });

    function listAlbums() {
        photoFactory.listAlbums()
            // .then((response) => console.log('album data from controller:', self.data))
            .catch((err) => alert('There was an error listing your albums: ' + err.message));
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
        photoFactory.createAlbum(albumName)
            .then((response) => {
                console.log('newAlbum:', self.data);
                listAlbums();
                self.viewAlbum(self.data.newAlbum.id, self.data.newAlbum.s3_name);
            })
            .catch((err) => {
                console.log('Error creating new album.');
            });
    }

    self.viewAlbum = function(album) {
        self.data.album = album;
        let newViewURI = '#!/photo/' + album.id + '/' + album.album_s3_name;
        window.location = newViewURI;
    }

    self.deleteAlbum = function(albumID) {
        photoFactory.deleteAlbum(albumID);
        listAlbums();
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

    self.goBack = function() {
        $window.history.back();
    }


}]);
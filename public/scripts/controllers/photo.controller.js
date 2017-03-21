/*jshint esversion: 6 */
angular.module('app').controller('PhotoController', ['$routeParams', '$scope', '$window', '$mdDialog', 'PhotoFactory', function($routeParams, $scope, $window, $mdDialog, PhotoFactory) {
    console.log("Photo Controller Started");

    const photoFactory = PhotoFactory;

    let self = this;
    self.data = photoFactory.data;

    self.albumID = $routeParams.albumid;
    self.albumS3ID = $routeParams.albums3id;
    self.photoFile = "empty";
    self.photoToUpload;
    self.addMessage = "Pick a photo to upload";
    self.statusOn = false;

    console.log('self.albumID', self.albumID);
    console.log('self.data.album.id', self.data.album.id);

    if (self.data.album.id === self.albumID) {
        viewAlbum(self.albumID, self.albumS3ID);
    } else {
        console.log('controller:', self.albumID[0]);
        photoFactory.getAlbum(self.albumID)
            .then((response) => {
                viewAlbum(self.albumID, self.albumS3ID);
            });
    }

    function viewAlbum(albumID, albumS3ID) {
        photoFactory.viewAlbum(albumID, albumS3ID)
            // .then((response) => console.log('photo data from controller:', self.data.photos))
            .catch((err) => alert('There was an error listing your photos: ' + err.message));
    }

    self.uploadPhoto = function() {
        var files = document.getElementById('input-file-id').files;
        if (!files.length) {
            // return alert('Please choose a file to upload first.');
            self.addMessage = "Please choose a file to upload first.";
        } else {

            self.statusOn = true;
            let fd = new FormData();
            fd.append('file', files[0]);
            photoFactory.uploadPhoto(fd)
                .then((response) => {
                    self.statusOn = false;
                    alert('Successfully uploaded photo.');
                    viewAlbum(self.albumID, self.albumS3ID);
                    self.data.newPhoto = {};
                    self.photoToUpload = undefined;
                    $mdDialog.cancel();
                })
                .catch((err) => alert('There was an error uploading your photos ' + err.message));
        }
    }

    self.deletePhoto = function(photoID) {
        photoFactory.deletePhoto(photoID)
            .then((data) => {
                alert('Successfully deleted photo.');
                viewAlbum(self.albumID, self.albumS3ID);
                $mdDialog.cancel();
            })
            .catch((err) => alert('There was an error deleting your photo: ', err.message));
    };

    self.zoomPhoto = function(ev, index) {
        self.photoToZoom = self.data.photos[index];
        $mdDialog.show({
            scope: $scope,
            preserveScope: true,
            templateUrl: 'views/templates/zoomphoto.template.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: self.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };

    self.addPhoto = function(ev) {
        self.data.newPhoto.coverPhoto = false;
        $mdDialog.show({
            scope: $scope,
            preserveScope: true,
            contentElement: '#addPhotoDialog',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        });
    };

    self.cancel = function() {
        $mdDialog.hide(alert, "finished");
        alert = undefined;
    };

    self.goBack = function() {
        $window.history.back();
    }

}]);
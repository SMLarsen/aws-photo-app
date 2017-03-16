/*jshint esversion: 6 */
angular.module('app').controller('PhotoController', ['$routeParams', '$scope', '$window', '$mdDialog', 'PhotoFactory', function($routeParams, $scope, $window, $mdDialog, PhotoFactory) {
    console.log("Photo Controller Started");

    const photoFactory = PhotoFactory;

    let self = this;
    self.data = photoFactory.data;

    self.albumID = $routeParams.albumid;
    self.albumS3ID = $routeParams.albums3id;
    console.log('photo params:', self.albumID, self.albumS3ID);
    self.photoFile = "empty";
    self.photoToUpload = {};
    self.addMessage = "Pick a photo to upload";
    self.statusOn = false;

    viewAlbum(self.albumID, self.albumS3ID);

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
            fd.append('fileName', files[0].name);
            fd.append('albumName', self.albumName);
            photoFactory.uploadPhoto(fd)
                .then((response) => {
                    self.statusOn = false;
                    alert('Successfully uploaded photo.');
                    // alert('Successfully uploaded photo.');
                    viewAlbum(self.albumName);
                    $mdDialog.cancel();
                })
                .catch((err) => alert('There was an error uploading your photos ' + err.message));
        }
    }

    self.deletePhoto = function(photo) {
        photoFactory.deletePhoto(self.albumName, photo)
            .then((data) => {
                alert('Successfully deleted photo.');
                viewAlbum(self.albumName);
                $mdDialog.cancel();
                self.zoomPhoto = {};
            })
            .catch((err) => alert('There was an error deleting your photo: ', err.message));
    };

    self.zoomPhoto = function(ev, index) {
        self.zoomPhoto = self.data.photos[index];
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
        $mdDialog.show({
            scope: $scope,
            preserveScope: true,
            templateUrl: 'views/templates/addphoto.template.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: self.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };

    self.cancel = function() {
        $mdDialog.hide();
    };

    self.goBack = function() {
        $window.history.back();
    }

}]);
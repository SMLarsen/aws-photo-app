/*jshint esversion: 6 */
angular.module('app').controller('PhotoController', ['$routeParams', '$scope', '$mdDialog', 'PhotoFactory', function($routeParams, $scope, $mdDialog, PhotoFactory) {
    console.log("Photo Controller Started");

    const photoFactory = PhotoFactory;

    let self = this;
    self.data = photoFactory.data;

    self.albumName = $routeParams.album;
    self.photoFile = "empty";
    self.photoToUpload;

    viewAlbum(self.albumName);

    function viewAlbum(albumName) {
        photoFactory.viewAlbum(albumName)
            // .then((response) => console.log('photo data from controller:', self.data.photos))
            .catch((err) => alert('There was an error listing your photos: ' + err.message));
    }

    self.uploadPhoto = function() {
        var files = document.getElementById('input-file-id').files;
        if (!files.length) {
            return alert('Please choose a file to upload first.');
        }
        let fd = new FormData();
        fd.append('file', files[0]);
        fd.append('fileName', files[0].name);
        fd.append('albumName', self.albumName);
        photoFactory.uploadPhoto(fd)
            .then((response) => {
                alert('Successfully uploaded photo.');
                viewAlbum(self.albumName);
            })
            .catch((err) => alert('There was an error uploading your photos ' + err.message));
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
        self.zoomPhoto = self.photos[index];
        $mdDialog.show({
            controller: DialogController,
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
            controller: DialogController,
            scope: $scope,
            preserveScope: true,
            templateUrl: 'views/templates/addphoto.template.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: self.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };

    function DialogController($scope, $mdDialog) {
        $scope.cancel = function() {
            $mdDialog.cancel();
            self.zoomPhoto = {};
            window.location.reload();
        };
    }

}]);
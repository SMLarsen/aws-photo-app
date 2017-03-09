/*jshint esversion: 6 */
angular.module('app').controller('PhotoController', ['$http', '$routeParams', '$scope', '$mdDialog', function($http, $routeParams, $scope, $mdDialog) {
    console.log("Photo Controller Started");
    let self = this;

    self.albumName = $routeParams.album;
    self.photoFile = "empty";
    self.photoToUpload = "empty";

    let albumBucketName = 'photo-app-aws';
    let bucketRegion = 'us-east-1';
    let IdentityPoolId = 'us-east-1:3f84d793-7a2a-4d80-ade0-1c5f223e68ca';

    AWS.config.update({});

    let s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {
            Bucket: albumBucketName
        }
    });

    viewAlbum(self.albumName);

    function viewAlbum(albumName) {
        let albumPhotosKey = encodeURIComponent(albumName) + '//';
        s3.listObjects({ Prefix: albumPhotosKey }, function(err, data) {
            if (err) {
                return alert('There was an error viewing your album: ' + err.message);
            }
            // `this` references the AWS.Response instance that represents the response
            let href = this.request.httpRequest.endpoint.href;
            let bucketUrl = href + albumBucketName + '/';

            self.photos = data.Contents.map(function(photo) {
                let photoKey = photo.Key;
                let photoUrl = bucketUrl + encodeURIComponent(photoKey);
                return photoUrl;
            });
            $scope.$apply();
        });
    }

    self.uploadPhoto = function() {
        let files = document.getElementById('input-file-id').files;
        if (!files.length) {
            return alert('Please choose a file to upload first.');
        }
        let file = files[0];
        let fileName = file.name;
        let albumPhotosKey = encodeURIComponent(self.albumName) + '//';
        let photoKey = albumPhotosKey + fileName;
        let photoUploadPromise = s3.upload({
            Key: photoKey,
            Body: file,
            ACL: 'public-read'
        }).promise();
        photoUploadPromise
            .then((data) => {
                alert('Successfully uploaded photo.');
                viewAlbum(self.albumName);
                return;
            })
            .catch((err) => alert('There was an error uploading your photo: ', err.message));
    }

    self.deletePhoto = function(photo) {
        var fileName = decodeURIComponent(photo.split("/").pop());
        console.log('fileName:', [fileName]);
        let photoDeletePromise = s3.deleteObject({
            Key: fileName
        }).promise();
        photoDeletePromise
            .then((data) => {
                alert('Successfully deleted photo.');
                viewAlbum(self.albumName);
                $mdDialog.cancel();
                self.zoomPhoto = {};
                window.location.reload();
                return;
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
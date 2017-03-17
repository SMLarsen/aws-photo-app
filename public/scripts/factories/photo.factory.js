/*jshint esversion: 6 */
app.factory("PhotoFactory", function($http) {
    console.log('PhotoFactory started');

    let photoData = {
        albums: [],
        album: {},
        photos: [],
        photo: {},
        newAlbum: {}
    };

    function listAlbums() {
        return $http.get('/album')
            .then((response) => {
                photoData.albums = response.data;
                console.log("photoData.albums", photoData.albums);
            })
            .catch((err) => console.log('Unable to retrieve albums', err));
    }

    function createAlbum(albumName) {
        console.log('factory create album:', albumName);
        return $http({
                method: 'POST',
                url: '/album',
                data: { 'albumName': albumName }
            })
            .then((response) => {
                photoData.newAlbum = response.data;
                listAlbums();
            })
            .catch((err) => console.log('Unable to add album', err));
    }

    function deleteAlbum(albumID) {
        return $http({
                method: 'DELETE',
                url: '/album/' + albumID
            })
            .then((response) => {
                listAlbums();
                // console.log('response', response);
            })
            .catch((err) => console.log('Unable to delete album', err));
    }

    function getAlbum(albumID) {
        // console.log('viewAlbum:', albumS3ID);
        return $http.get('/album/' + albumID)
            .then((response) => photoData.album = response.data)
            .catch((err) => console.log('Unable to retrieve album', err));
    }

    function viewAlbum(albumID, albumS3ID) {
        // console.log('viewAlbum:', albumS3ID);
        return $http.get('/photo/' + albumID + '/' + albumS3ID)
            .then((response) => photoData.photos = response.data)
            .catch((err) => console.log('Unable to retrieve photos', err));
    }

    /*
    Can all be done on server
    1) Get photo DB rows 
    2) Add rows to data.photos
    3) Get s3 photos for album = albumS3ID 
    4) Add photos to data.photos by matching photo.s3_name
    */


    /*
    Can all be done on server
    1) Create S3_name
    2) Insert row to photos
    3) Upload photo to S3 
    4) Add photos to data.photos by matching photo.s3_name
    */


    function uploadPhoto(file) {
        file.append('albumID', photoData.album.id);
        file.append('albumName', photoData.album.name);
        file.append('albumS3Name', photoData.album.album_s3_name);
        file.append('caption', photoData.album.caption);
        return $http({
                method: 'POST',
                url: '/photo/' + photoData.album.album_s3_name,
                data: file,
                headers: { 'Content-Type': undefined }
            })
            .catch((err) => console.log('Unable to add photo', err));
    }

    function deletePhoto(albumName, photo) {
        photo = photo.substring(photo.lastIndexOf("/") + 1);
        return $http({
                method: 'DELETE',
                url: '/photo/' + photo
            })
            .then((data) => viewAlbum(albumName))
            .catch((err) => alert('There was an error deleting your photo: ', err.message));
    }

    let publicApi = {
        data: photoData,
        listAlbums: function() {
            return listAlbums();
        },
        getAlbum: function(albumID) {
            return getAlbum(albumID);
        },
        createAlbum: function(albumName) {
            return createAlbum(albumName);
        },
        deleteAlbum: function(albumID) {
            return deleteAlbum(albumID);
        },
        viewAlbum: function(albumID, albumS3ID) {
            return viewAlbum(albumID, albumS3ID);
        },
        uploadPhoto: function(files) {
            return uploadPhoto(files);
        },
        deletePhoto: function(albumName, photo) {
            return deletePhoto(albumName, photo);
        }
    };

    return publicApi;

}); // END: PhotoFactory
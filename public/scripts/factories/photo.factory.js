/*jshint esversion: 6 */
app.factory("PhotoFactory", function($http) {
    console.log('PhotoFactory started');

    let photoData = {
        albums: [],
        photos: [],
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

    function viewAlbum(albumS3ID) {
        console.log('viewAlbum:', albumS3ID);
        return $http.get('/photo/' + albumS3ID)
            .then((response) => photoData.photos = response.data)
            .catch((err) => console.log('Unable to retrieve photos', err));
    }

    function uploadPhoto(file) {
        return $http({
                method: 'POST',
                url: '/photo/' + file.get('albumName'),
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
        createAlbum: function(albumName) {
            return createAlbum(albumName);
        },
        deleteAlbum: function(albumID) {
            return deleteAlbum(albumID);
        },
        viewAlbum: function(albumName) {
            return viewAlbum(albumName);
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
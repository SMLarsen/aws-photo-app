/*jshint esversion: 6 */
const app = angular.module('app', ['ngRoute', 'ngMaterial']);


AWS.config.update({
    accessKeyId: 'AKIAJHRJMQFBP24I5VBQ',
    secretAccessKey: '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'
});


app.config(function($routeProvider, $mdThemingProvider) {

    // $mdThemingProvider.theme('default')
    //   .primaryPalette('red')
    //   .accentPalette('blue')
    //   .warnPalette('yellow')
    //   .dark();

    $routeProvider
        .when('/home', {
            templateUrl: 'views/templates/home.html',
            controller: 'HomeController',
            controllerAs: 'hc'
        })
        .when('/album', {
            templateUrl: 'views/templates/album.html',
            controller: 'AlbumController',
            controllerAs: 'ac'
        })
        .when('/photo/:album', {
            templateUrl: 'views/templates/photo.html',
            controller: 'PhotoController',
            controllerAs: 'pc'
        })
        .when('/slideshow', {
            templateUrl: 'views/templates/slideshow.html',
            controller: 'SlideshowController',
            controllerAs: 'sc'
        })
        .otherwise({
            redirectTo: 'home'
        });
});
/*jshint esversion: 6 */
const app = angular.module('app', ['ngRoute', 'ngMaterial']);

app.config(function($routeProvider, $mdThemingProvider) {

    $mdThemingProvider.theme('default')
        .primaryPalette('teal')
        .accentPalette('blue')
        .warnPalette('yellow')
        .dark();

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
        .when('/photo/:albumid/:albums3id', {
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
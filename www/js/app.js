// GDG DevFest App
// Author: Kyle Paul, GDG Kansas City

(function() {
  'use strict';

  var app = angular.module('devfest', ['ionic', 'firebase', 'ngOpenFB'])
    .run(function($ionicPlatform, ngFB) {
      $ionicPlatform.ready(function() {
        // Override the default HTML alert with native dialog - requires the cordova dialogs plugin
        if (navigator.notification) {
          window.alert = function (message) {
            navigator.notification.alert(
              message,    // message
              null,       // callback
              'DevFest',  // title
              'OK'        // buttonName
            );
          };
        }

        // In Ionic the accessory bar is hidden by default. Do not hide the keyboard accessory bar for this app
        // so the drop-down form input can be used properly.
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleLightContent(); //status bar will have white text and icons
        }

        // Facebook integration - Register your app and get your App ID from http://developer.facebook.com
        ngFB.init({appId: 'your-app-id'});
      });
    })

    .config(function($stateProvider, $urlRouterProvider) {
      $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.profile', {
        url: '/profile',
        views: {
          'menuContent': {
            templateUrl: 'templates/profile.html',
            controller: 'ProfileCtrl'
          }
        }
      })

      .state('app.favorites', {
        url: "/favorites",
        views: {
          'menuContent' :{
            templateUrl: "templates/favorites.html",
            controller: "FavoritesCtrl"
          }
        }
      })

     .state('app.sessions', {
        url: "/sessions",
        views: {
            'menuContent': {
              templateUrl: "templates/sessions.html",
              controller: 'SessionsCtrl'
            }
        }
      })

      .state('app.session', {
        url: "/sessions/:sessionId",
        views: {
          'menuContent': {
            templateUrl: "templates/session.html",
            controller: 'SessionCtrl'
          }
        }
      });
      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/app/sessions');
    });
}())
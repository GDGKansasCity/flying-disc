(function() {
  'use strict';
  
  var appCtrl = function($rootScope, $scope, $ionicModal, $ionicLoading, $timeout, Config, AuthService, TwitterService) {
    $scope.date = new Date();

    // Init the login modal
    $scope.loginData = {};
    $scope.loginMsg = '';

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    })
    .then(function(modal) {
      $scope.modal = modal;
      // Now that modal is ready, let's have them login first
      $scope.loginModal();
    });

    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.loginModal = function() {
      $scope.loginData = {};
      $scope.loginMsg = '';
      if ($scope.modal != undefined)
        $scope.modal.show();
    };

    // Firebase social login (Facebook, Twitter, GitHub, Google+)
    $scope.login = function(authMethod) {
      AuthService.$authWithOAuthRedirect(authMethod)
        .then(function(authData) {
          // user successfully logged in
        })
        .catch(function(error) {
          if (error.code === 'TRANSPORT_UNAVAILABLE') {
            AuthService.$authWithOAuthPopup(authMethod)
              .then(function(authData) {
                // user successfully logged in using pop-up method
              })
          } else {
            console.log(error);
          }
      });
    };
    
    AuthService.$onAuth(function(authData) {
      if (authData === null) {
        console.log('Not logged in yet');
//        $scope.modal.show();
      } else {
//        console.log(authData);
        $scope.modal.hide();
      }
      $rootScope.authData = authData;
    });

    // Logout
    $scope.logout = function() {
      AuthService.$unauth();
      showToast('Logout success!');
    };

    function showToast(message) {
      if (window.plugins && window.plugins.toast) {
        window.plugins.toast.showShortCenter(message);
      } else {
        $ionicLoading.show({ template: message, noBackdrop: true, duration: 2000 });
      }
    }
  };

  var app = angular.module('devfest')
    .controller('AppCtrl', ['$rootScope', '$scope', '$ionicModal', '$ionicLoading', '$timeout', 'Config', 'AuthService', 'TwitterService', appCtrl]);
}())
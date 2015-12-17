(function() {
  'use strict';
  
  var appCtrl = function($rootScope, $scope, $ionicModal, $ionicLoading, $ionicUser, $timeout, $state, Config, AuthService, UserService) {
    var date = new Date();
    $scope.users = UserService;
    $scope.eventName = Config.eventName;
    $scope.groupName = Config.name;
    $scope.copyright = date.getFullYear() == '2015' ? '2015' : '2015-' + date.getFullYear();
    
    // initialize Ionic Push
    Ionic.io();
    var push = new Ionic.Push({
      "debug": false,
      "onNotification": function(notification) {
        var payload = notification.payload;
        console.log(notification);
        console.log(payload);
      },
      "onRegister": function(data) {
        console.log(data.token);
      },
      "pluginConfig": {
         "android": {
           "iconColor": "#B71C1C",
           "forceShow": true,
           "vibrate": true
         }
      } 
    });

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
    };

    // Firebase social login (Facebook, Twitter, GitHub, Google+)
    $scope.login = function(authMethod) {
      AuthService.$authWithOAuthRedirect(authMethod)
        .then(function(authData) {
          // user successfully logged in
          $state.go('app.sessions');
        })
        .catch(function(error) {
          if (error.code === 'TRANSPORT_UNAVAILABLE') {
            AuthService.$authWithOAuthPopup(authMethod)
              .then(function(authData) {
                // user successfully logged in using pop-up method
                $state.go('app.sessions');
              })
          } else {
            console.log(error);
          }
      });
    };
    
    AuthService.$onAuth(function(authData) {
      if (authData === null) {
        if ($scope.modal !== undefined) {
          $scope.modal.show();
        }
      } else {
        checkIfUserExists(authData);
        if ($scope.modal !== undefined) {
          $scope.modal.hide();
        }
      }
    });

    // Logout
    $scope.logout = function() {
      push.unregister();
      AuthService.$unauth();
      showToast('Logout success!');
      $state.go('app.sessions');
    };
    
    function checkIfUserExists(data) {
      var users = UserService.$ref();
      users.once('value', function(snapshot) {
        var user = {
          uid: data.uid,
          user_id: data.uid,
          provider: data.provider,
          name: $scope.getName(data),
          email: $scope.getEmail(data),
          handle: $scope.getHandle(data),
          link: $scope.getLink(data),
          image: $scope.getImage(data)
        };
        
        // send user info to Firebase
        users.child(data.uid).set(user);
        
        // send user info to Ionic
        $ionicUser.identify(user);
        
        // Register with the Ionic Push service
        push.register(function(token) {
          $ionicUser.push('_push.android_tokens', token, true);
          users.child(data.uid).update({token: token.token});
        });
        
        $rootScope.user = user;
      });
    }
    
    $scope.getName = function(data) {
      if (data) {
        switch(data.provider) {
          case 'google':
            return data.google.displayName;
          case 'facebook':
            return data.facebook.displayName;
          case 'twitter':
            return data.twitter.displayName;
          case 'github':
            return data.github.displayName;
        }
      }
    };
    
    $scope.getHandle = function(data) {
      if (data) {
        switch(data.provider) {
          case 'google':
            return data.google.email ? data.google.email : null;
          case 'facebook':
            return data.facebook.email ? data.facebook.email : null;
          case 'twitter':
            return data.twitter.username;
          case 'github':
            return data.github.username;
        }
      }
    };
    
    $scope.getEmail = function(data) {
      if (data) {
        switch(data.provider) {
          case 'google':
            return data.google.email ? data.google.email : null;
          case 'facebook':
            return data.facebook.email ? data.facebook.email : null;
          case 'twitter':
            return null;
          case 'github':
            return data.github.cachedUserProfile.email;
        }
      }
    };
    
    $scope.getImage = function(data) {
      if (data) {
        switch(data.provider) {
          case 'google':
            return data.google.profileImageURL;
          case 'facebook':
            return data.facebook.profileImageURL;
          case 'twitter':
            return data.twitter.cachedUserProfile.profile_image_url_https;
          case 'github':
            return data.github.cachedUserProfile.avatar_url;
        }
      }
    };
    
    $scope.getLink = function(data) {
      if (data) {
        switch(data.provider) {
          case 'google':
            return data.google.cachedUserProfile.link;
          case 'facebook':
            return data.facebook.cachedUserProfile.link;
          case 'twitter':
            return 'https://twitter.com/' + data.twitter.username;
          case 'github':
            return data.github.cachedUserProfile.html_url;
        }
      }
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
    .controller('AppCtrl', ['$rootScope', '$scope', '$ionicModal', '$ionicLoading', '$ionicUser', '$timeout', '$state', 'Config', 'AuthService', 'UserService', 'SponsorService', appCtrl]);
}())
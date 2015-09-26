(function() {
  'use strict';
  
  var sessionCtrl = function($scope, $stateParams, $q, $ionicLoading, $timeout, Config, SessionService, FavoriteService) {
    $scope.favorites = FavoriteService.favorites;
    $scope.session = SessionService.$getRecord($stateParams.sessionId);
    $scope.session.isFave = false;
    
    angular.forEach($scope.favorites, function(fave) {
      if ($scope.session.$id == fave.$id)
        $scope.session.isFave = true;
    });

    $scope.share = function() {
      if (window.plugins && window.plugins.socialsharing) {
        window.plugins.socialsharing.share(
          'I\'ll be attending the session: ' + $scope.session.title + '.',
          Config.eventName, null, Config.eventURL,
          function() {
            // Share success
          },
          function (error) {
            console.log('Share failed: ' + error)
          });
      } else {
        console.log('Share plugin not available');
      }
    };

    $scope.addFavorite = function() {
      var currentSession = $scope.session;
      if (!currentSession.isFave) {
        FavoriteService.addFave(currentSession, successCB, errorCB);
        var ref = SessionService.$ref();
        ref.child(currentSession.$id).child('faveCounter').set(currentSession.faveCounter + 1);
        currentSession.isFave = true;
      } else {
        currentSession.isFave = false;
        FavoriteService.removeFave(currentSession);
        var ref = SessionService.$ref();
        ref.child(currentSession.$id).child('faveCounter').set(currentSession.faveCounter - 1);
      }
    };

    function errorCB() { showToast('Session was already added.') }
    function successCB(session) { showToast('Added to favorites!'); session.isFave = true; }

    function showToast(message) {
      if (window.plugins && window.plugins.toast) {
        window.plugins.toast.showShortCenter(message);
      } else {
        $ionicLoading.show({ template: message, noBackdrop: true, duration: 2000 });
      }
    }

    $scope.addToCalendar = function() {
      if (window.plugins && window.plugins.calendar) {
        var hour = $scope.session.time.substring(0, $scope.session.time.indexOf(':'));
        var minutes = $scope.session.time.substring($scope.session.time.indexOf(':')+1, $scope.session.time.indexOf(' '));
        if ($scope.session.time.indexOf('pm') > -1)
            hour = parseInt(hour) + 12;
        
        function parseDate(str) {
          var d = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
          return (d) ? new Date(d[1], d[2]-1, d[3]) : new Date();
        }
        
        var event = parseDate(Config.eventDate);
        var sessionStart = new Date(event.getFullYear(), event.getMonth(), event.getDate(), hour, minutes, 0);
        var sessionEnd = parseDate(Config.eventDate);
        sessionEnd.setTime(parseInt(sessionStart.getTime()) + parseInt(Config.sessionLength));

        var calOptions = window.plugins.calendar.getCalendarOptions();
        calOptions.firstReminderMinutes = 10;
        calOptions.secondReminderMinutes = 5;
        window.plugins.calendar.createEventWithOptions($scope.session.title, $scope.session.room, $scope.session.description, sessionStart, sessionEnd, calOptions,
          function () {
            showToast($scope.session.title + ' has been added to your calendar.');
          },
          function (error) {
            console.log('Calendar fail ' + error);
          }
        );
      } else {
        console.log('Calendar plugin not available.');
      }
    };
  };

  var app = angular.module('devfest')
    .controller('SessionCtrl', ['$scope', '$stateParams', '$q', '$ionicLoading', '$timeout', 'Config', 'SessionService', 'FavoriteService', sessionCtrl]);
}())
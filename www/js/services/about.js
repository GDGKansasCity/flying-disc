(function() {
  'use strict';
  
  var about = function($http, Config) {
    return {
      getAbout: function() {
        return $http.jsonp('https://www.googleapis.com/plus/v1/people/' + Config.id + 
            '?callback=JSON_CALLBACK&fields=aboutMe%2Ccover%2Cimage%2CplusOneCount%2Curls&key=' + Config.google_api)
          .success(function(data) {})
          .error(function(error) {});
      },
      getImage: function(id) {
        return $http.jsonp('https://www.googleapis.com/plus/v1/people/' + id + '?callback=JSON_CALLBACK&fields=image&key=' + Config.google_api)
          .success(function(data) {})
          .error(function(error) {});
      }
    };
  };

  var app = angular.module('devfest')
    .service('AboutService', ['$http', 'Config', about]);
}())
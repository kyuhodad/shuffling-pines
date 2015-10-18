var app = angular.module('ShufflingPinesApp', []);

app.controller('FormController', ['$scope', function($scope){
  $scope.hasFormController = true;
  
  this.debugON = true;
  this.addGuest = function () {
    this.jsonString = angular.toJson(this.data);
  };
}]);

app.controller('TabController', [function(){

}]);

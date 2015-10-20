var app = angular.module('ShufflingPinesApp', []);

app.service ("testService", function () {
  // function is a constructor
  this.todoList = [];
  this.addTodo = function (todo) {
  };
});

app.factory ("testFactory1", function () {
  var obj = {};
  obj.todoList = [];
  obj.addTodo = function (todo) {
  };
  return obj;
});

app.factory ("testFactory2", function () {
  return function (description, priority) {
    return {
      description: description,
      priority: priority,
      callback: function () {
      }
    };
  };
});

app.service ("guestManager", function () {
  this.guests = JSON.parse(sessionStorage.getItem("ShufflingPinesApp_Guests")) || [];

  this.addGuest = function (guestData) {
    this.guests.push(guestData);
    this.updateGuestList ();
  };

  this.removeGuest = function (index) {
    this.guests.splice(index, 1);
    this.updateGuestList ();
  };

  this.updateGuestList = function () {
    sessionStorage.setItem('ShufflingPinesApp_Guests', JSON.stringify(this.guests));
  };
});

app.controller('FormController', ['$scope', function($scope){
  $scope.hasFormController = true;

  this.debugON = true;
  this.addGuest = function () {
    this.jsonString = angular.toJson(this.data);

  };

}]);

app.controller('TabController', [function(){

}]);

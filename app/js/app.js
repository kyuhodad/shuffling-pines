var app = angular.module('ShufflingPinesApp', []);

app.service ("guestManager", ['$rootScope', function ($rootScope) {

  this.getGuestListFromStorage = function () {
    var item = localStorage.getItem("ShufflingPinesApp_Guests");
    return item ? angular.fromJson(item) : [];
    // return item ? JSON.parse(item) : [];
  };

  this.updateGuestListOnStorage = function (guests) {
    localStorage.setItem('ShufflingPinesApp_Guests', angular.toJson(guests));
    // localStorage.setItem('ShufflingPinesApp_Guests', JSON.stringify(guests));
  };

  this.addGuest = function (guestData) {
    $rootScope.$broadcast('ADD_GUEST', guestData);
  };
  this.removeGuest = function (index) {
    $rootScope.$broadcast('REMOVE_GUEST', index);
  };
}]);

// ---------------------
// Guest Data object to store
// ---------------------
function GuestData (formInput) {
    this.name = formInput.name;
    this.transitionDate = formInput.transitionDate ? new Date(formInput.transitionDate.valueOf()) : {};
    this.actionOption = formInput.actionOption;
    this.pickupLocation = formInput.pickupLocation;
}

// ---------------------
// Tab Controller....
// ---------------------
app.controller('TabController', ['$scope', 'guestManager',  function($scope, guestManager){
  var vm = this;

  vm.activeTab = 0;

  vm.setTab = function (idx) {
    vm.activeTab = idx;
  };

  // Event handlers
  $scope.$on('ADD_GUEST', function (evt) {
    vm.activeTab = 1;
  });
}]);

// ---------------------
// Form Controller....
// ---------------------
app.controller('FormController', ['$scope', 'guestManager',  function($scope, guestManager){
  var vm = this;

  // Initialize
  initFormInput();

  // Submit the form input
  vm.submitForm = function () {
    if (vm.input.name) {
      guestManager.addGuest(new GuestData(vm.input));
      initFormInput();
    }
  };

  // Check to see if the Location feild needs to be shown
  vm.needShowLocation = function () {
    return vm.input.actionOption === 'pickup';
  };

  // initialize form input
  function initFormInput () {
    vm.input = {
      name:           '',
      transitionDate: new Date(),
      actionOption:   'pickup',
      pickupLocation: ''
    };
  }
}]);

// ---------------------
// Guests Controller....
// ---------------------
app.controller('GuestsController', ['$scope', 'guestManager',  function($scope, guestManager){
  var vm = this;

  vm.guests = guestManager.getGuestListFromStorage ();

  vm.addGuest = function (guestData) {
    vm.guests.push(guestData);
    vm.updateGuestList ();
    console.log('Guest List:');
    console.log(angular.toJson(vm.guests, true));
  };

  vm.removeGuest = function (index) {
    if (window.confirm('Are you sure to delete a guest data?')) {
      vm.guests.splice(index, 1);
      vm.updateGuestList ();
    }
  };

  vm.removeAllGuests = function () {
    vm.guests.length = 0;
    vm.updateGuestList ();
  };

  vm.updateGuestList = function () {
    guestManager.updateGuestListOnStorage(vm.guests);
  };

  // Event handlers
  $scope.$on('ADD_GUEST', function (evt, guestData) {
    vm.addGuest(guestData);
  });
  $scope.$on('REMOVE_GUEST', function (evt, index) {
    vm.removeGuest(index);
  });

}]);

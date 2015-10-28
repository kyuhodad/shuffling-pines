var app = angular.module('ShufflingPinesApp', []);

// ---------------------
// Guest Data object to store
// ---------------------
function GuestData (dataIn) {
    var formInput = dataIn || {};
    this.name = formInput.name || '';
    this.transitionDate = formInput.transitionDate ? new Date(formInput.transitionDate.valueOf()) : new Date();
    this.actionOption = formInput.actionOption || 'pickup';
    this.pickupLocation = formInput.pickupLocation || 'Gate1';
    this.actionState0 = formInput.actionState0 || false;
    this.actionState1 = formInput.actionState1 || false;
    this.actionState2 = formInput.actionState2 || false;
    this.isDeleted = formInput.isDeleted || false;

    this.isValid = function () {
      if (!this.name || !this.transitionDate) return false;
      if ( (this.actionOption !== "pickup") && (this.actionOption !== "dropoff") ) return false;
      if ( (this.actionOption === "pickup") && !this.pickupLocation) return false;
      return true;
    };

    this.actionOptionString = function () {
      return this.actionOption === "pickup" ? "Pick-up" :
             this.actionOption === "dropoff" ? "Drop-off" : "";
    };

    this.getPickupLocation = function () {
      return this.actionOption === "pickup" ? this.pickupLocation : "";
    };

    this.getStateString = function (stateId) {
      if (stateId === 0) return this.actionOptionString();
      if (stateId === 1) return "Arrived";
      else return "Pick-up";
    };

    this.isStateDisabled = function (stateId) {
      if (this.isDeleted) return true;
      if (stateId === 2) return !this.actionState1;
      if (stateId === 1) return !this.actionState0;
      return false;
    };

    this.onChangeActionState = function (stateId) {
      if (stateId === 0) {
        if (!this.actionState0) {
          this.actionState1 = this.actionState2 = false;
        }
      } else if (stateId === 1) {
        if (!this.actionState1) {
          this.actionState2 = false;
        }
      }
    }

    this.classDeleted = function () {
      return this.isDeleted ? "deleted-guest" : "";
    }
}

// ---------------------
// Guest manager service....
// ---------------------
app.service ("guestManager", ['$rootScope', function ($rootScope) {
  var self = this;
  var itemFromStorage = localStorage.getItem("ShufflingPinesApp_Guests");
  var guestsTemp = itemFromStorage ? angular.fromJson(itemFromStorage) : [];
  this.guests = [];
  for (var i=0; i<guestsTemp.length; i++) {
    this.guests[i] = new GuestData(guestsTemp[i]);
  }

  this.update = function () {
    localStorage.setItem('ShufflingPinesApp_Guests', angular.toJson(self.guests));
    console.log('Guest List:');
    console.log(angular.toJson(this.guests, true));
  }

  this.addGuest = function (guestData) {
    this.guests.push(guestData);
    this.update ();
  };

  this.softDeleteGuest = function (index) {
    this.guests[index].isDeleted = true;
    this.update ();
  };

  this.deleteGuest = function (index) {
    this.guests.splice(index, 1);
    this.update ();
  };

  // This is for testing purpose.
  this.deleteAllGuests = function () {
    this.guests.length = 0;
    this.update ();
  };

}]);

// ---------------------
// Form Controller....
// ---------------------
app.controller('FormController', ['$scope', 'guestManager', '$timeout', function($scope, guestManager, $timeout) {
  var vm = this;

  // Initialize
  initFormInput();

  // Submit the form input
  vm.submitForm = function () {
    if (vm.input.isValid()) {
      // guestManager.addGuest(new GuestData(vm.input));
      guestManager.addGuest(vm.input);
      initFormInput();

      // Show the guests tab.
      $('#guestsTab').tab('show');
    }
  };

  // Check to see if the Location feild needs to be shown
  vm.needShowLocation = function () {
    return vm.input.actionOption === 'pickup';
  };

  // initialize form input
  function initFormInput () {
    vm.input = new GuestData ();
  }

  function isInputValid () {
    vm.input.name
  }

}]);

// ---------------------
// Guests Controller....
// ---------------------
app.controller('GuestsController', ['$scope', 'guestManager',  function($scope, guestManager){
  var vm = this;

  vm.getGuestList = function () {
    return guestManager.guests;
  };

  vm.softDeleteGuest = function (index) {
    guestManager.softDeleteGuest(index);
  };

  vm.deleteGuest = function (index) {
    if (window.confirm('Are you sure to delete a guest data?')) {
      guestManager.deleteGuest(index);
    }
  };

  vm.isDeleted = function (index) {
    return guestManager.guests[index].isDeleted;
  };

  vm.deleteAllGuests = function () {
    guestManager.deleteAllGuests();
  };

  vm.update = function () {
    guestManager.update ();
  };

  vm.onChangeActionState = function (index, stateId) {
    guestManager.guests[index].onChangeActionState(stateId);
    guestManager.update ();
  }

  vm.onChangeActionState = function (index, stateId) {
    guestManager.guests[index].onChangeActionState(stateId);
    guestManager.update ();
  }

}]);

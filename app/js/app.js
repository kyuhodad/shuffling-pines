var app = angular.module('ShufflingPinesApp', []);

// ---------------------
// Factory for Guest Data object
// ---------------------
app.factory("GuestData", function () {
  var GuestData = function (dataIn) {
    var formInput = dataIn || {};
    this.name = formInput.name || '';
    this.transitionDate = formInput.transitionDate ? new Date(formInput.transitionDate.valueOf()) : new Date();
    this.actionOption = formInput.actionOption || 'pickup';
    this.pickupLocation = formInput.pickupLocation || 'Gate1';
    this.actionState = formInput.actionState || 0;
    this.isDeleted = formInput.isDeleted || false;

    this.isValid = function () {
      if (!this.name || !this.transitionDate) return false;
      if ( (this.actionOption !== "pickup") && (this.actionOption !== "dropoff") ) return false;
      if ( (this.actionOption === "pickup") && !this.pickupLocation) return false;
      return true;
    };

    // Returns the display string for the action options
    this.actionOptionString = function () {
      return this.actionOption === "pickup" ? "Pick-up" :
             this.actionOption === "dropoff" ? "Drop-off" : "";
    };

    // Returns pickup location only if the action option is "pickup"
    this.getPickupLocation = function () {
      return this.actionOption === "pickup" ? this.pickupLocation : "";
    };

    // Get the current status string
    this.getCurrentStatusString = function () {
      return this.getStatusString (this.actionState);
    }

    // Get status string of given state id
    this.getStatusString = function (stateId) {
      if (stateId === 0) return this.actionOptionString();
      if (stateId === 1) return "Arrived";
      else return "Pick-up";
    };

    //
    this.classDeleted = function () {
      return this.isDeleted ? "deleted-guest" : "";
    }
  };

  return GuestData;
});

// ---------------------
// Guest manager service....
// ---------------------
app.service ("guestManager", ['GuestData', function (GuestData) {
  var self = this;
  var itemFromStorage = localStorage.getItem("ShufflingPinesApp_Guests");
  var guestsTemp = itemFromStorage ? angular.fromJson(itemFromStorage) : [];
  this.guests = [];
  if (guestsTemp.length === 0) {
    this.guests.push( new GuestData({
      name: 'John Smith',
      transitionDate: new Date(2020, 0, 30)
    }));
    this.guests.push( new GuestData({
      name: 'Terry Sherman',
      transitionDate: new Date(2015, 6, 20),
      actionOption: 'dropoff'
    }));
  } else {
    for (var i=0; i<guestsTemp.length; i++) {
      this.guests[i] = new GuestData(guestsTemp[i]);
    }
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

  this.isDeleted = function (index) {
    return this.guests[index].isDeleted;
  }

  // This is for testing purpose.
  this.deleteAllGuests = function () {
    this.guests.length = 0;
    this.update ();
  };
}]);

// ---------------------
// Form Controller....
// ---------------------
app.controller('FormController', ['guestManager', 'GuestData', function(guestManager, GuestData) {
  var vm = this;

  // Initialize
  initFormInput();

  // Submit the form input
  vm.submitForm = function () {
    if (vm.input.isValid()) {
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
app.controller('GuestsController', ['guestManager',  function(guestManager){
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
    return guestManager.isDeleted(index);
  };

  vm.deleteAllGuests = function () {
    guestManager.deleteAllGuests();
  };

  vm.update = function () {
    guestManager.update ();
  };
}]);

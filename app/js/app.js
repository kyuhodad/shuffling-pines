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
      if (!this.name || !this.transitionDate) { return false; }
      if ( (this.actionOption !== "pickup") && (this.actionOption !== "dropoff") ) {
        return false;
      }
      if ( (this.actionOption === "pickup") ) {
        if (!this.pickupLocation) {
          return false;
        }
        if (this.pickupLocation.length === 0) {
          return false;
        }
      }
      return true;
    };

    // Returns pickup location only if the action option is "pickup"
    this.getPickupLocation = function () {
      return this.actionOption === "pickup" ? this.pickupLocation : "";
    };

    // Returns the display string for the action options
    this.actionOptionString = function () {
      return this.actionOption === "pickup" ? "Pick-up" :
             this.actionOption === "dropoff" ? "Drop-off" : "";
    };

    // Get the current status string
    this.getCurrentStatusString = function () {
      return this.getStatusString (this.actionState);
    };

    // Get status string of given state id
    this.getStatusString = function (stateId) {
      if (stateId === 0) {
        return this.actionOptionString();
      }
      if (stateId === 1) {
        return "Arrived";
      }
      else {
        return "Pick-up";
      }
    };
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
  };

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
}]);

// ---------------------
// Guests Controller....
// ---------------------
app.controller('GuestsController', ['guestManager', 'GuestData', function(guestManager, GuestData){
  var vm = this;
  vm._DEBUG = false;

  vm.getGuestList = function () {
    return guestManager.guests;
  };

  vm.needToShowChangeStateButton = function (index, buttonName) {
    // buttonName = 'Arrived' or 'Pickup'
    if (buttonName === 'Arrived') {
      return guestManager.guests[index].actionState === 0;
    }
    if (buttonName === 'Pickup') {
      return guestManager.guests[index].actionState === 1;
    }
    return false;
  };

  vm.onClickChangeActionState = function (index) {
    if (guestManager.guests[index].actionState > 1) {
      return;
    }
    guestManager.guests[index].actionState++;
  };

  vm.getCurrentStatusString = function (index) {
    return guestManager.guests[index].getCurrentStatusString();
  };

  vm.softDeleteGuest = function (index) {
    guestManager.softDeleteGuest(index);
  };

  vm.onChangeSoftDeleteGuest = function (index) {
    guestManager.update();
  };

  vm.isSoftDeleted = function (index) {
    return guestManager.isDeleted(index);
  };

  vm.deleteGuest = function (index) {
    if (window.confirm('Are you sure to delete a guest data?')) {
      guestManager.deleteGuest(index);
    }
  };

  vm.deleteAllGuests = function () {
    guestManager.deleteAllGuests();
  };

  vm.edit = {};
  vm.edit.data = new GuestData();
  vm.edit.index = -1;
  vm.edit.key = "";
  vm.onBeginEdit = function (index, keyToEdit) {
    vm.edit.index = index;
    vm.edit.key = keyToEdit;
    vm.edit.data[vm.edit.key] = guestManager.guests[vm.edit.index][vm.edit.key];
  };
  vm.isInEditMode = function (index, keyToEdit) {
    if (vm.edit.index === -1) {
      return false;
    }
    return ( (vm.edit.index === index) && (vm.edit.key === keyToEdit) );
  };
  vm.onEndEdit = function () {
    if (vm.edit.index >= 0) {
      guestManager.guests[vm.edit.index][vm.edit.key] = vm.edit.data[vm.edit.key];
    }
    vm.edit.index = -1;
    vm.edit.key = "";
  };

}]);

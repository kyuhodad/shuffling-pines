// 'use strict';
describe('Shuffling Pines App', function () {

  // Initialize module
  beforeEach(module('ShufflingPinesApp'));

  // Mock the localStorage.
  var fakeLocalStorage;
  beforeEach(function () {
    fakeLocalStorage = new FakeLocalStorage();
    spyOn(localStorage, "getItem").and.callFake(fakeLocalStorage.getItem);
    spyOn(localStorage, "setItem").and.callFake(fakeLocalStorage.setItem);

    spyOn(console, "log").and.callFake(function(arg) {});
  });

  describe('GuestData factory', function () {
    var GuestData;
    beforeEach( function () {
      inject(['$injector', function($injector) {
        GuestData = $injector.get('GuestData');
      }]);
    });

    it('should be instantiated with new operator.', function () {
      expect(new GuestData ()).not.toBeNull();
    });

    it('should not have name with deafult constructor.', function () {
      var guest = new GuestData ();
      expect(guest.name).toBe('');
    });

    it('should allow to intialize with given value.', function () {
      var date = new Date(2020, 10, 20);
      var guest = new GuestData ({
        name:"Kyeong Hwi Lee",
        transitionDate: new Date(2020, 10, 20),
        actionOption:'pickup',
        pickupLocation:'Lot 10',
        actionState: 1,
        isDeleted: false
      });

      expect(guest.name).toBe('Kyeong Hwi Lee');
      expect(guest.transitionDate.getTime()).toBe(date.getTime());
      expect(guest.actionOption).toBe('pickup');
      expect(guest.pickupLocation).toBe('Lot 10');
      expect(guest.actionState).toBe(1);
      expect(guest.isDeleted).not.toBeTruthy();
    });

    it('should clone an object by constructor by giving GuestData object.', function () {
      var guest1 = new GuestData({name:"Guest Name"});
      var guest2 = new GuestData (guest1);
      var strGuest1 = JSON.stringify(guest1);
      var strGuest2 = JSON.stringify(guest2);
      expect(strGuest1).toBe(strGuest2);
    });

    it('should be invalid without name.', function () {
      var guest = new GuestData ();
      expect(guest.isValid()).not.toBeTruthy();
      guest.name = 'Name Given';
      expect(guest.isValid()).toBeTruthy();
    });

    it('should be invalid without pickup location if actionOption is <pickup>.', function () {
      var guest = new GuestData ({name: 'Name'});
      expect(guest.isValid()).toBeTruthy();
      guest.pickupLocation = '';
      expect(guest.isValid()).not.toBeTruthy();
    });

    it('should be invalid if actionOption is not one of <pickup> and <dropoff>.', function () {
      var guest = new GuestData ({name: 'Name', actionOption:"something"});
      expect(guest.isValid()).not.toBeTruthy();
      guest.actionOption = 'dropoff';
      expect(guest.isValid()).toBeTruthy();
      guest.actionOption = 'pickup';
      expect(guest.isValid()).toBeTruthy();
    });

    it('should return proper pickup location by getPickupLocation() if actionOption is <pickup>.', function () {
      var guest = new GuestData ();
      guest.actionOption = 'pickup';
      guest.pickupLocation = 'Lot-10';
      expect(guest.getPickupLocation()).toBe('Lot-10');
    });

    it('should return empty string by getPickupLocation() if actionOption is <dropoff>.', function () {
      var guest = new GuestData ();
      guest.actionOption = 'dropoff';
      guest.pickupLocation = 'Lot-10';
      expect(guest.getPickupLocation()).toBe('');
    });

    it('should returns readable display strings for the actionOption.', function () {
      var guest = new GuestData ({name: 'Name'});
      guest.actionOption = 'dropoff';
      expect(guest.actionOptionString()).toBe('Drop-off');
      guest.actionOption = 'pickup';
      expect(guest.actionOptionString()).toBe('Pick-up');
    });

    it('should returns readable display strings for the current state.', function () {
      var guest = new GuestData ({name: 'Name'});
      guest.actionOption = 'pickup';

      guest.actionState = 0;
      expect(guest.getCurrentStatusString()).toBe('Pick-up');
      guest.actionState = 1;
      expect(guest.getCurrentStatusString()).toBe('Arrived');
      guest.actionState = 2;
      expect(guest.getCurrentStatusString()).toBe('Pick-up');

      guest.actionOption = 'dropoff';
      guest.actionState = 0;
      expect(guest.actionOptionString()).toBe('Drop-off');
      guest.actionState = 1;
      expect(guest.getCurrentStatusString()).toBe('Arrived');
      guest.actionState = 2;
      expect(guest.getCurrentStatusString()).toBe('Pick-up');
    });

    it('should returns readable display strings for the specified states.', function () {
      var guest = new GuestData ({name: 'Name'});

      guest.actionOption = 'pickup';
      expect(guest.getStatusString(0)).toBe('Pick-up');
      expect(guest.getStatusString(1)).toBe('Arrived');
      expect(guest.getStatusString(2)).toBe('Pick-up');

      guest.actionOption = 'dropoff';
      expect(guest.getStatusString(0)).toBe('Drop-off');
      expect(guest.getStatusString(1)).toBe('Arrived');
      expect(guest.getStatusString(2)).toBe('Pick-up');
    });
  });

  describe('guestManager service', function () {
    var guestManager;
    var GuestData;

    beforeEach( function () {
      inject(['$injector', function($injector) {
        guestManager = $injector.get('guestManager');
        GuestData = $injector.get('GuestData');
      }]);
    });

    // Convenient methods for testing
    beforeEach( function () {
      // Search a guest with given name
      this.searchGuestFromList = function (name) {
        for(var key in guestManager.guests) {
          if (guestManager.guests[key].name === name) {
            return key;
          }
        }
        return -1;
      };

      // Match given string to localStorage.
      this.matchFromLocalStorage = function (strToMatch) {
        return localStorage.getItem ("ShufflingPinesApp_Guests").search(strToMatch) >= 0;
      };
    });

    it('should populate a couple of guest data initially.', function () {
      expect(guestManager.guests.length).toBeGreaterThan(1);
    });

    it('should have instances of GuestData type object in guests array.', function () {
      expect(guestManager.guests[0] instanceof GuestData).toBeTruthy();
    });

    it('should save date to localStorage on calling update function.', function () {
      var newGuestName = 'Guest New';
      expect(this.matchFromLocalStorage(newGuestName)).not.toBeTruthy();

      localStorage.setItem.calls.reset();
      expect(localStorage.setItem).not.toHaveBeenCalled();

      var guest = new GuestData({name: newGuestName});
      guestManager.guests.push(guest);
      guestManager.update();

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(this.matchFromLocalStorage(newGuestName)).toBeTruthy();
    });

    //
    // Test addGuest()
    //
    it('should increase the number of guests on adding a guest.', function () {
      var oldNumberOfGuests = guestManager.guests.length;

      var guest = new GuestData({name: 'Guest1'});
      guestManager.addGuest(guest);
      expect(guestManager.guests.length).toBe(oldNumberOfGuests + 1);
    });

    it('should call setItem function of localStorage on adding a guest.', function () {
      var oldNumberOfGuests = guestManager.guests.length;

      // Reset the spyOn localStorage.setItem
      localStorage.setItem.calls.reset();
      expect(localStorage.setItem).not.toHaveBeenCalled();

      var guest = new GuestData({name: 'Guest1'});
      guestManager.addGuest(guest);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should find the name of added guest from guests list and localStorage', function () {
      var newGuestName = 'Test Name for Shuffling Pines';

      expect(this.matchFromLocalStorage(newGuestName)).not.toBeTruthy();
      expect(this.searchGuestFromList(newGuestName)).toBe(-1);

      // Add a guest with newGuestName
      var guest = new GuestData({name: newGuestName});
      guestManager.addGuest(guest);

      expect(this.matchFromLocalStorage(newGuestName)).toBeTruthy();
      expect(this.searchGuestFromList(newGuestName)).toBeGreaterThan(-1);
    });

    //
    // Test deleteGuest()
    //
    it('should decrease the number of guests on deleting a guest.', function () {
      var oldNumberOfGuests = guestManager.guests.length;
      guestManager.deleteGuest(oldNumberOfGuests - 1);
      expect(guestManager.guests.length).toBe(oldNumberOfGuests - 1);
    });

    it('should call setItem function of localStorage on deleting a guest.', function () {
      var oldNumberOfGuests = guestManager.guests.length;

      localStorage.setItem.calls.reset();
      expect(localStorage.setItem).not.toHaveBeenCalled();

      guestManager.deleteGuest(0);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should not be found the name of deleted guest from guests list and localStorage', function () {
      var newGuestName = 'Test Name for Shuffling Pines';
      var guest = new GuestData({name: newGuestName});
      guestManager.addGuest(guest);
      expect(this.matchFromLocalStorage(newGuestName)).toBeTruthy();
      var index = this.searchGuestFromList(newGuestName);
      expect(index).toBeGreaterThan(-1);

      guestManager.deleteGuest(index);

      expect(this.matchFromLocalStorage(newGuestName)).not.toBeTruthy();
      expect(this.searchGuestFromList(newGuestName)).toBe(-1);
    });

    //
    // Test softDeleteGuest()
    //
    it('should set deleted flag to the soft-deleted guest.', function () {
      var numberOfGuests = guestManager.guests.length;

      expect(guestManager.guests[0].isDeleted).not.toBeTruthy();
      guestManager.softDeleteGuest(0);
      expect(guestManager.guests[0].isDeleted).toBeTruthy();
      expect(guestManager.guests.length).toBe(numberOfGuests);
    });
    it('should return true for the soft-deleted guest by isDeletd() function.', function () {
      var numberOfGuests = guestManager.guests.length;

      expect(guestManager.isDeleted(numberOfGuests-1)).not.toBeTruthy();
      guestManager.softDeleteGuest(numberOfGuests-1);
      expect(guestManager.isDeleted(numberOfGuests-1)).toBeTruthy();
    });

  });

  describe('FormController test', function () {
    var formVm, guestManager;
    var GuestData;

    beforeEach( function () {
      inject (['$controller', '$rootScope', '$injector', function ($controller, $rootScope, $injector) {
        // Create FormController under $rootScope
        var formScope = $rootScope.$new();
        formVm = $controller('FormController as formVm', {$scope:formScope});

        guestManager = $injector.get('guestManager');
        GuestData = $injector.get('GuestData');
        // Create GuestsController under $rootScope
        // var guestsScope = $rootScope.$new();
        // guestsVm = $controller('GuestsController as guestsVm', {$scope:guestsScope});

      }]);
    });
    beforeEach( function () {
      spyOn(guestManager, "addGuest").and.callThrough();
    });

    beforeEach( function () {

      this.isSameGuestData = function (d1, d2, includeDate) {
        if (includeDate === undefined) {
          includeDate = true;
        }
        if (!includeDate) {
          d2.transitionDate = new Date(d1.transitionDate.getTime());
        }
        return JSON.stringify(d1)
                   .localeCompare(JSON.stringify(d2)) === 0;
      };
    });

    it('should be initialized with default constructor of GuestData factory.', function () {
      expect(this.isSameGuestData(formVm.input, new GuestData(), false)).toBeTruthy();
    });

    it('should have valid initial value if a name is set.', function () {
      expect(formVm.input.isValid()).not.toBeTruthy();
      formVm.input.name = 'Kyeong Lee';
      expect(formVm.input.isValid()).toBeTruthy();
    });

    it('should show the pickup location only if actionOption is <pickup>.', function () {
      formVm.input.actionOption = 'pickup';
      expect(formVm.needShowLocation()).toBeTruthy();

      formVm.input.actionOption = 'dropoff';
      expect(formVm.needShowLocation()).not.toBeTruthy();
    });

    it('should not submit without name input.', function() {
      var numberOfGuests = guestManager.guests.length;
      formVm.input.name = "";
      formVm.submitForm ();
      expect(guestManager.guests.length).toBe(numberOfGuests);
    });

    it('should call addGuest function of guestManager with the form data.', function() {
      formVm.input.name = "Guest Name";
      var inputData = new GuestData(formVm.input);

      formVm.submitForm ();

      var argToAddGuest = guestManager.addGuest.calls.argsFor(0);
      expect(this.isSameGuestData(inputData, argToAddGuest[0])).toBeTruthy();
    });

    it('should reset the form data with initial data after submitting.', function() {
      formVm.input.name = "New Guest";
      formVm.submitForm ();
      expect(this.isSameGuestData(formVm.input, new GuestData(), false)).toBeTruthy();
    });

    it('should log all the guests on submitting.', function() {
      var name = "Guest To Check Log";
      formVm.input.name = name;
      formVm.submitForm ();

      expect(console.log).toHaveBeenCalled();
      var allArgs = console.log.calls.allArgs();
      expect(allArgs.length).toBe(2);
      expect(allArgs[1]).toMatch(name);
    });

    it('should activate guest list tab.', function () {
      var $documentMock;
      inject(['$document', function ($document) {
        $documentMock = $document;
      }]);
      // Build a bacic structure for the tabs to test.
      $documentMock.find('body').append(
        '<div id="mockDOM">' +
        '<ul class="nav nav-tabs">' +
          '<li id="tab1" role="presentation" class="active">' +
            '<a href="#form" role="tab" data-toggle="tab"></a>' +
          '</li>' +
          '<li id="tab2" role="presentation">' +
            '<a id="guestsTab" href="#guests" role="tab" data-toggle="tab"></a>' +
          '</li>' +
        '</ul>' +
        '<div class="tab-content">' +
          '<div class="tab-pane active" id="form"></div>' +
          '<div class="tab-pane" id="guests"></div>' +
        '</div></div>');

      var classTab1 = $('#tab1').attr('class');
      var classTab2 = $('#tab2').attr('class');
      expect(classTab1).toMatch('active');
      expect(classTab2).not.toMatch('active');

      var classForm = $('#form').attr('class');
      var classGuests = $('#guests').attr('class');
      expect(classForm).toMatch('active');
      expect(classGuests).not.toMatch('active');

      var name = "Guest To Check Log";
      formVm.input.name = name;
      formVm.submitForm ();

      classTab1 = $('#tab1').attr('class');
      classTab2 = $('#tab2').attr('class');
      expect(classTab1).not.toMatch('active');
      expect(classTab2).toMatch('active');

      classForm = $('#form').attr('class');
      classGuests = $('#guests').attr('class');
      expect(classForm).not.toMatch('active');
      expect(classGuests).toMatch('active');

      // Cleanup the test DOM elements
      $('#mockDOM').remove();
    });
  });

  describe('GuestsController test', function () {
    var guestsVm, guestManager, $window;
    var GuestData;
    var confirmDeleteOKOrCancel; // OK

    beforeEach( function () {
      inject (['$controller', '$rootScope', '$injector', function ($controller, $rootScope, $injector) {
        // Create FormController under $rootScope
        var formScope = $rootScope.$new();
        guestsVm = $controller('GuestsController as guestsVm', {$scope:formScope});

        guestManager = $injector.get('guestManager');
        GuestData = $injector.get('GuestData');
        $window = $injector.get('$window');
      }]);
    });
    beforeEach( function () {
      confirmDeleteOKOrCancel = true; // OK
      spyOn(guestManager, "update").and.callThrough();
      spyOn(guestManager, "softDeleteGuest").and.callThrough();
      spyOn(guestManager, "deleteGuest").and.callThrough();
      spyOn($window, "confirm").and.callFake(function () {
        return confirmDeleteOKOrCancel;
      });
    });

    it('should return a couple of guest data at the beginning.', function () {
      expect(guestsVm.getGuestList().length).toBeGreaterThan(1);
    });

    it('should return same list as guestManager service has.', function () {
      expect(guestsVm.getGuestList()).toEqual(guestManager.guests);
    });

    it('should have an option for moving to <Arrived> state from <Pick-up> or <Drop-off>.', function () {
      var idx = guestsVm.getGuestList().length;
      guestManager.addGuest(new GuestData({name: "Guest1", actionOption: 'pickup'}));
      expect(guestsVm.needToShowChangeStateButton(idx, 'Arrived')).toBeTruthy ();
      expect(guestsVm.needToShowChangeStateButton(idx, 'Pickup')).not.toBeTruthy ();
      var str = guestsVm.getCurrentStatusString(idx);
      expect(guestsVm.getCurrentStatusString(idx)).toMatch ('Pick-up');

      idx++;
      guestManager.addGuest(new GuestData({name: "Guest2", actionOption: 'dropoff'}));
      expect(guestsVm.needToShowChangeStateButton(idx, 'Arrived')).toBeTruthy ();
      expect(guestsVm.needToShowChangeStateButton(idx, 'Pickup')).not.toBeTruthy ();
      expect(guestsVm.getCurrentStatusString(idx)).toMatch ('Drop-off');
    });

    it('should have an option for moving to <Pickup> state on clicking <Arrived> buttton.', function () {
      var idx = guestsVm.getGuestList().length;
      guestManager.addGuest(new GuestData({name: "Guest1", actionOption: 'pickup'}));
      guestsVm.onClickChangeActionState(idx);
      expect(guestsVm.needToShowChangeStateButton(idx, 'Arrived')).not.toBeTruthy ();
      expect(guestsVm.needToShowChangeStateButton(idx, 'Pickup')).toBeTruthy ();
      expect(guestsVm.getCurrentStatusString(idx)).toMatch ('Arrived');

      idx++;
      guestManager.addGuest(new GuestData({name: "Guest2", actionOption: 'dropoff'}));
      guestsVm.onClickChangeActionState(idx);
      expect(guestsVm.needToShowChangeStateButton(idx, 'Arrived')).not.toBeTruthy ();
      expect(guestsVm.needToShowChangeStateButton(idx, 'Pickup')).toBeTruthy ();
      expect(guestsVm.getCurrentStatusString(idx)).toMatch ('Arrived');
    });

    it('should not have any option after chaning two times.', function () {
      var idx = guestsVm.getGuestList().length;
      guestManager.addGuest(new GuestData({name: "Guest1", actionOption: 'pickup'}));
      guestsVm.onClickChangeActionState(idx);
      guestsVm.onClickChangeActionState(idx);
      expect(guestsVm.needToShowChangeStateButton(idx, 'Arrived')).not.toBeTruthy ();
      expect(guestsVm.needToShowChangeStateButton(idx, 'Pickup')).not.toBeTruthy ();
      expect(guestsVm.getCurrentStatusString(idx)).toMatch ('Pick-up');

      idx = guestsVm.getGuestList().length;
      guestManager.addGuest(new GuestData({name: "Guest2", actionOption: 'dropoff'}));
      guestsVm.onClickChangeActionState(idx);
      guestsVm.onClickChangeActionState(idx);
      expect(guestsVm.needToShowChangeStateButton(idx, 'Arrived')).not.toBeTruthy ();
      expect(guestsVm.needToShowChangeStateButton(idx, 'Pickup')).not.toBeTruthy ();
      expect(guestsVm.getCurrentStatusString(idx)).toMatch ('Pick-up');
    });

    it('should call softDeleteGuest function of guestManager after applying soft delete operation.', function () {
      var idx = guestsVm.getGuestList().length;
      guestManager.addGuest(new GuestData({name: "Guest To Delete"}));

      guestManager.softDeleteGuest.calls.reset();
      guestsVm.softDeleteGuest (idx);
      expect(guestManager.softDeleteGuest).toHaveBeenCalled ();
      expect(guestManager.softDeleteGuest.calls.argsFor(0)).toEqual ([idx]);
    });

    it('should call update function of guestManager after chaging soft delete flag.', function () {
      var idx = guestsVm.getGuestList().length;
      guestManager.addGuest(new GuestData({name: "Guest To Delete"}));

      guestManager.update.calls.reset();
      guestsVm.getGuestList()[idx].isDeleted = true;
      guestsVm.onChangeSoftDeleteGuest(idx);

      expect(guestManager.update).toHaveBeenCalled ();
    });

    it('should show OK / Cancel button after being soft-deleted.', function () {
      var idx = guestsVm.getGuestList().length;
      guestManager.addGuest(new GuestData({name: "Guest To Delete"}));

      // Soft-delete
      guestsVm.getGuestList()[idx].isDeleted = true;
      guestsVm.onChangeSoftDeleteGuest(idx);

      // NOTE: ng-show attaributes of the buttons are controlled by guestsVm.isSoftDeleted function.
      expect(guestsVm.isSoftDeleted(idx)).toBeTruthy ();
    });

    it('should show the confirmation dialog on clicking the delete confirmation(OK) button.', function () {
      var idx = guestsVm.getGuestList().length;
      guestManager.addGuest(new GuestData({name: "Guest To Delete"}));

      // Soft-delete
      guestsVm.getGuestList()[idx].isDeleted = true;
      guestsVm.onChangeSoftDeleteGuest(idx);

      confirmDeleteOKOrCancel = true;
      guestsVm.deleteGuest(idx);
      expect($window.confirm).toHaveBeenCalled ();
    });

    it('should remove the guest data on OK in the confirmation dialog.', function () {
      var originalLength = guestsVm.getGuestList().length;
      var idx = originalLength;

      guestManager.addGuest(new GuestData({name: "Guest To Delete"}));

      // Soft-delete
      guestsVm.getGuestList()[idx].isDeleted = true;
      guestsVm.onChangeSoftDeleteGuest(idx);

      // reset the spy on guestManager.deleteGuest
      guestManager.deleteGuest.calls.reset ();

      // OK to delete
      confirmDeleteOKOrCancel = true;
      guestsVm.deleteGuest(idx);

      // guestManager.deleteGuest should get called with idx
      expect(guestManager.deleteGuest).toHaveBeenCalled();
      expect(guestManager.deleteGuest.calls.argsFor(0)).toEqual([idx]);
      expect(guestsVm.getGuestList().length).toBe(originalLength);
    });

    it('should not remove the guest data on Cancel in the confirmation dialog.', function () {
      var originalLength = guestsVm.getGuestList().length;
      var idx = originalLength;

      guestManager.addGuest(new GuestData({name: "Guest To Delete"}));

      // reset the spy on guestManager.deleteGuest
      guestManager.deleteGuest.calls.reset ();

      // Soft-delete
      guestsVm.getGuestList()[idx].isDeleted = true;
      guestsVm.onChangeSoftDeleteGuest(idx);

      // Cancel the deletion
      confirmDeleteOKOrCancel = false;
      guestsVm.deleteGuest(idx);

      // guestManager.deleteGuest should not get called.
      expect(guestManager.deleteGuest).not.toHaveBeenCalled();
      expect(guestsVm.getGuestList().length).toBe(originalLength+1);
    });

    it('should show edit and soft-delete button on clicking the delete cancel button.', function () {
      var idx = guestsVm.getGuestList().length;
      guestManager.addGuest(new GuestData({name: "Guest To Delete"}));

      // Soft-delete
      guestsVm.getGuestList()[idx].isDeleted = true;
      guestsVm.onChangeSoftDeleteGuest(idx);

      // Cancel
      guestsVm.getGuestList()[idx].isDeleted = false;
      guestsVm.onChangeSoftDeleteGuest(idx);

      // NOTE: Edit/Soft-Delete buttons are available when guestsVm.isSoftDeleted(index) is false.
      expect(guestsVm.isSoftDeleted(idx)).not.toBeTruthy ();
    });

    it('should show the template for editing on clicking edit button.', function () {
      var idx = guestsVm.getGuestList().length;
      guestManager.addGuest(new GuestData({name: "Guest To Edit"}));

      // The template id should be "display_guest_row_tpl" in regular mode.
      expect(guestsVm.getGuestRowTemplate(idx)).toMatch("display_guest_row_tpl");

      // Begin edit
      guestsVm.onBeginEdit(idx);

      // The template id should be "edit_guest_row_tpl"
      expect(guestsVm.getGuestRowTemplate(idx)).toMatch("edit_guest_row_tpl");
    });

    it('should apply the changed guest data on clicking OK button in edit mode.', function () {
      var idx = guestsVm.getGuestList().length;
      guestManager.addGuest(new GuestData({name: "Guest To Edit"}));

      // Begin edit
      guestsVm.onBeginEdit(idx);

      // Change data
      var newName = "Changed Guest Name";
      var newDate = Date('December 17, 2020');
      guestsVm.edit.data.name = newName;
      guestsVm.edit.data.transitionDate = newDate;
      guestsVm.edit.data.actionOption = "dropoff";

      // OK the changes
      guestsVm.onOKEdit();

      var guest = guestsVm.getGuestList()[idx];
      expect(guest.name).toBe(newName);
      expect(guest.transitionDate.valueOf()).toBe(newDate.valueOf());
      expect(guest.actionOption).toMatch("dropoff");
    });

    it('should not apply any of the changes on clicking Cancel button in edit mode.', function () {
      var idx = guestsVm.getGuestList().length;
      var guestAdded = new GuestData({name: "Guest To Edit"});
      guestManager.addGuest(guestAdded);

      // Begin edit
      guestsVm.onBeginEdit(idx);

      // Change data
      var newName = "Changed Guest Name";
      var newDate = Date('December 17, 2020');
      guestsVm.edit.data.name = newName;
      guestsVm.edit.data.transitionDate = newDate;
      guestsVm.edit.data.actionOption = "dropoff";

      // Cacel the changes
      guestsVm.onCancelEdit();

      var guest = guestsVm.getGuestList()[idx];
      expect(guestAdded).toEqual(guest);
    });

  });

  //
  // FakeLocalStorage class
  //
  function FakeLocalStorage () {
    var self = this;
    this.storage = {};
    this.getItem = function (key) {
      return self.storage[key] || '[]';
    };
    this.setItem = function (key, value) {
      self.storage[key] = value + '';
    };
    this.clear = function () {
      self.storage = {};
    };
  }
});

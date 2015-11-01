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
          if (guestManager.guests[key].name === name) return key;
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
        if (includeDate === undefined) includeDate = true;
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
      $document = angular.element(document);
      $document.find('body').append(
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
        '<div>');

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
    });
  });

  describe('GuestsController test', function () {

  });

  // var guestManager;
  // var formVm, guestsVm;
  // var fakeLocalStorage;
  //
  // //
  // // Instantiate controllers
  // //
  // beforeEach(module('ShufflingPinesApp'));
  // beforeEach( function () {
  //   inject (['$controller', '$rootScope', 'guestManager', function ($controller, $rootScope, $guestManager) {
  //     // Create FormController under $rootScope
  //     var formScope = $rootScope.$new();
  //     formVm = $controller('FormController as formVm', {$scope:formScope});
  //
  //     // Create GuestsController under $rootScope
  //     var guestsScope = $rootScope.$new();
  //     guestsVm = $controller('GuestsController as guestsVm', {$scope:guestsScope});
  //
  //     guestManager = $guestManager;
  //   }]);
  // });
  //
  // //
  // // Mock localStorage
  // //
  // beforeEach(function () {
  //   fakeLocalStorage = new FakeLocalStorage();
  //   spyOn(localStorage, "getItem").and.callFake(fakeLocalStorage.getItem);
  //   spyOn(localStorage, "setItem").and.callFake(fakeLocalStorage.setItem);
  //   guestsVm.deleteAllGuests();
  //
  //   spyOn(console, "log");
  // });

  //
  // Tests for FormController
  //
  /*
  xdescribe('Form controller', function() {
    // Default input.
    var defaultInput = {
            name:           '',
            transitionDate: new Date(),
            actionOption:   'pickup',
            pickupLocation: 'Gate1',
            actionState0: false,
            actionState1: false,
            actionState2: false
    };

    it('should be initialized with default values.', function() {
      expect(formVm.input.name).toBe(defaultInput.name);
      expect(formVm.input.transitionDate.toDateString()).toBe(defaultInput.transitionDate.toDateString());
      expect(formVm.input.actionOption).toBe(defaultInput.actionOption);
      expect(formVm.input.pickupLocation).toBe(defaultInput.pickupLocation);
    });

    it('should show loaction input field only if pickup option is selected.', function() {
      expect(formVm.needShowLocation()).toBeTruthy();
      formVm.input.actionOption = 'dropoff';
      expect(formVm.needShowLocation()).not.toBeTruthy();
    });

    it('should not submit without name input.', function() {
      var numberOfGuests = guestManager.guests.length;
      formVm.submitForm ();
      var numberOfGuests2 = guestManager.guests.length;
      expect(numberOfGuests2).toBe(numberOfGuests);
    });

    it('should not submit with invalid pickup location input.', function() {
      var oldNumberOfGuests = guestManager.guests.length;
      formVm.input.name = "Lee";
      formVm.input.pickupLocation = "";
      formVm.submitForm ();

      var guestList = guestManager.guests;
      expect(guestList.length).toBe(oldNumberOfGuests);
    });

    it('should submit with valid input.', function() {
      var oldNumberOfGuests = guestManager.guests.length;

      var name = "Kyeong Hwi Lee";
      formVm.input.name = name;
      formVm.submitForm ();

      var guestList = guestManager.guests;
      expect(guestList.length).toBe(oldNumberOfGuests + 1);
      expect(guestList[oldNumberOfGuests].name).toBe(name);
    });

    it('should log guest list to the console on submitting.', function() {
      var name = "Kyeong Hwi Lee";
      formVm.input.name = name;
      formVm.submitForm ();
      var logInput = console.log.calls.argsFor(1);
      expect(logInput).toMatch(name);
    });

    // if ('should move to Guests tab after submitting the form.', function () {
    //   var tabNavElem  = $('<ul class="nav nav-tabs">' +
    //                       '<li role="presentation" class="active"><a></a></li>' +
    //                       '<li id="guestsTab" role="presentation"></li>' +
    //                       '</ul>');
    //   var tabContents = $('<div class="tab-content">' +
    //                       '<div class="tab-pane active" id="form"></div>' +
    //                       '<div class="tab-pane" id="guests"></div>' +
    //                       '</div>');
    // });

  });

  //
  // Tests for GuestsController
  //
  xdescribe('Guests controller', function() {

    it('should be initialized ', function() {
      expect(true).toBeTruthy();
      // expect(formCtrl.debugON).toBe(true);
    });

  });
  */

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

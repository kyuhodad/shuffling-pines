// 'use strict';
describe('Shuffling Pines App', function () {
  var guestManager;
  var formVm, guestsVm;
  var fakeLocalStorage;

  //
  // Instantiate controllers
  //
  beforeEach(module('ShufflingPinesApp'));
  beforeEach( function () {
    inject (['$controller', '$rootScope', 'guestManager', function ($controller, $rootScope, $guestManager) {
      // Create FormController under $rootScope
      var formScope = $rootScope.$new();
      formVm = $controller('FormController as formVm', {$scope:formScope});

      // Create GuestsController under $rootScope
      var guestsScope = $rootScope.$new();
      guestsVm = $controller('GuestsController as guestsVm', {$scope:guestsScope});

      guestManager = $guestManager;
    }]);
  });

  //
  // Mock localStorage
  //
  beforeEach(function () {
    fakeLocalStorage = new FakeLocalStorage();
    spyOn(localStorage, "getItem").and.callFake(fakeLocalStorage.getItem);
    spyOn(localStorage, "setItem").and.callFake(fakeLocalStorage.setItem);
    guestsVm.deleteAllGuests();

    spyOn(console, "log");
  });

  //
  // Tests for FormController
  //
  describe('Form controller', function() {
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
  describe('Guests controller', function() {

    it('should be initialized ', function() {
      expect(true).toBeTruthy();
      // expect(formCtrl.debugON).toBe(true);
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

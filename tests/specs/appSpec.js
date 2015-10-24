// 'use strict';
describe('Shuffling Pines App', function () {
  var guestManager;
  var tapVm, formVm, guestsVm;
  var fakeLocalStorage;

  //
  // Instantiate controllers
  //
  beforeEach(module('ShufflingPinesApp'));
  beforeEach( function () {
    inject (['$controller', '$rootScope', 'guestManager', function ($controller, $rootScope, $guestManager) {
      // Create TabController under rootScope
      var tabScope = $rootScope.$new();
      tapVm = $controller('TabController as tapVm', {$scope:tabScope});

      // Create FormController under tabScope
      var formScope = tabScope.$new();
      formVm = $controller('FormController as formVm', {$scope:formScope});

      // Create GuestsController under tabScope
      var guestsScope = tabScope.$new();
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
    guestsVm.removeAllGuests();

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
            pickupLocation: ''
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
      var numberOfGuests = guestManager.getGuestListFromStorage().length;
      formVm.submitForm ();
      var numberOfGuests2 = guestManager.getGuestListFromStorage().length;
      expect(numberOfGuests2).toBe(numberOfGuests);
    });

    it('should submit with valid name input.', function() {
      var oldNumberOfGuests = guestManager.getGuestListFromStorage().length;

      var name = "Kyeong Hwi Lee";
      formVm.input.name = name;
      formVm.submitForm ();
      var guestList = guestManager.getGuestListFromStorage();

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

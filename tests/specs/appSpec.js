// 'use strict';
describe('Form controller', function() {
  // var scope;
  var guestManager;
  var formVm, guestsVm;
  var defaultInput = {
          name:           '',
          transitionDate: new Date(),
          actionOption:   'pickup',
          pickupLocation: ''
  };

  beforeEach(module('ShufflingPinesApp'));
  beforeEach( function () {
    inject (['$controller', '$rootScope', 'guestManager', function ($controller, $rootScope, $guestManager) {
      var formScope = $rootScope.$new();
      formVm = $controller('FormController as formVm', {$scope:formScope});

      var guestsScope = $rootScope.$new();
      guestsVm = $controller('GuestsController as guestsVm', {$scope:guestsScope});

      guestManager = $guestManager;
    }]);
  });

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

});

describe('Guests controller', function() {

  // var scope;
  var guestsVm;

  beforeEach(module('ShufflingPinesApp'));
  beforeEach( function () {
    inject (function ($controller, $rootScope) {
      scope = $rootScope.$new();
      // formVm = $controller('FormController as formVm', {$scope:scope});
      guestsVm = $controller('GuestsController as guestsVm', {$scope:scope});
      // guestsVm = $controller('GuestsController as guestsVm');
    });
  });

  it('should be initialized ', function() {
    expect(true).toBeTruthy();
    // expect(formCtrl.debugON).toBe(true);
  });

});

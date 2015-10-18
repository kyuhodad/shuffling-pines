// 'use strict';

describe('Form controller', function() {

  var scope;
  var formCtrl;

  beforeEach(module('ShufflingPinesApp'));
  beforeEach( function () {
    inject (function ($controller, $rootScope) {
      scope = $rootScope.$new();
      formCtrl = $controller('FormController as formCtrl', {$scope:scope});
    });
  });

  it('should be OK', function() {
    expect(scope.hasFormController).toBeTruthy();
    expect(formCtrl.debugON).toBe(true);
  });

});

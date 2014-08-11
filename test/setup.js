global.expect = require('chai').expect;
require('chai').use(require('sinon-chai'));

function useSinon() {
  beforeEach(function () {
    global.sinon = require('sinon').sandbox.create();
  });

  afterEach(function () {
    global.sinon.restore();
  });
}

//! @package test
//! @file test2.js
//! Testing Coveralls

const assert = require('assert');


/**
 *  Simple test to check testing suite configuration
 *
 */
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
    assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

var index = require('../index.js');

/**
 * Compares getStringToPrint result with a String
 *
 * @return {boolean}
 */
describe('Index', function () {
  it('should print Hello World!', function () {
    assert.equal(index.getStringToPrint(), "Hello World!");
  });
});
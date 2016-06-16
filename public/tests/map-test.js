var assert = chai.assert;

console.log('tests started')

describe('getRandom', function() {

  it('should generate random number from -3 to -34 bigger than 2', function() {
    assert.isAtLeast(getRandom(3, 34), 3);
  });

  it('should generate random number from -3 to -34 not bigger than 34', function() {
    assert.isAtMost(getRandom(3, 34), 33);
  });

});


mocha.run();
const {test, assert} = require('scar');

assert.is_undef = x => assert.equal(x, undefined);
assert.is_obj = x => assert.equal(typeof x, 'object');
assert.is_fun = x => assert.equal(typeof x, 'function');
assert.is_num = x => assert.equal(typeof x, 'number');
assert.len = (x, n) => assert.equal(x.length, n);
assert.inst_of = (x, t) => assert.ok(x instanceof t);
assert.is_true = x => assert.equal(x, true);
assert.is_false = x => assert.equal(x, false);
assert.match = (x, r) => assert.ok(r.test(x));

require('./sub/Mkr');
require('./sub/Reporter');
require('./sub/Suite');
require('./sub/Target');
require('./sub/Task');

test.cli();

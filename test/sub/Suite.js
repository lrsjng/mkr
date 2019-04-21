const path = require('path');
const sinon = require('sinon');
const {test, assert} = require('scar');
const Suite = require('../../lib/Suite');
const Target = require('../../lib/Target');

test('Suite is function', () => {
    assert.is_fun(Suite);
});

test('Suite expects 1 argument', () => {
    assert.len(Suite, 1);
});

test('Suite constructor without argument', () => {
    const suite = new Suite();

    assert.inst_of(suite, Suite);
    assert.deepEqual(suite._targets, {});
    assert.deepEqual(suite._defaults, []);
    assert.deepEqual(suite.args, {});
});

test('Suite constructor with argument', () => {
    const obj = {};
    const suite = new Suite(obj);

    assert.inst_of(suite, Suite);
    assert.deepEqual(suite._targets, {});
    assert.deepEqual(suite._defaults, []);
    assert.deepEqual(suite.args, obj);
});


test('Suite target() is function', () => {
    const suite = new Suite();
    assert.is_fun(suite.target);
});

test('Suite target() expects 3 arguments', () => {
    const suite = new Suite();
    assert.len(suite.target, 3);
});

test('Suite target() returns Target instance', () => {
    const suite = new Suite();
    assert.inst_of(suite.target(), Target);
});

test('Suite target() sets arguments correct', () => {
    const obj1 = {};
    const obj2 = {};
    const obj3 = {};
    const suite = new Suite();
    const target = suite.target(obj1, obj2, obj3);

    assert.equal(target.name, obj1);
    assert.equal(target.dependencies, obj2);
    assert.equal(target.description, obj3);
    assert.deepEqual(target._tasks, []);
});


test('Suite defaults() is function', () => {
    const suite = new Suite();
    assert.is_fun(suite.defaults);
});

test('Suite defaults() expects 1 argument', () => {
    const suite = new Suite();
    assert.len(suite.defaults, 1);
});

test('Suite defaults() is chainable, returns this', () => {
    const suite = new Suite();
    assert.equal(suite.defaults(), suite);
});

test('Suite defaults() works with non-array argument', () => {
    const obj = {};
    const suite = new Suite();
    suite.defaults(obj);
    assert.deepEqual(suite._defaults, [obj]);
});

test('Suite defaults() works with array argument', () => {
    const arr = [{}];
    const suite = new Suite();
    suite.defaults(arr);
    assert.deepEqual(suite._defaults, arr);
});


test('Suite include() is function', () => {
    const suite = new Suite();
    assert.is_fun(suite.include);
});

test('Suite include() expects 1 argument', () => {
    const suite = new Suite();
    assert.len(suite.include, 1);
});

test('Suite include() throws if no argument', () => {
    const suite = new Suite();
    assert.throws(() => {
        suite.include();
    }, TypeError);
});

test('Suite include() throws non string argument', () => {
    const suite = new Suite();
    assert.throws(() => {
        suite.include(true);
    }, TypeError);
});

test('Suite include() throws on file not found', () => {
    const suite = new Suite();
    assert.throws(() => {
        suite.include('unknown');
    }, /file not found/);
});

test('Suite include() throws on file exports no function', () => {
    const suite = new Suite();
    assert.throws(() => {
        suite.include(path.join(__dirname, '../assets/empty.js'));
    }, /does not export a function/);
});

test('Suite include() returns included filename', () => {
    const filename = path.join(__dirname, '../assets/fn.js');
    const suite = new Suite();
    const ret = suite.include(filename);
    assert.equal(ret, filename);
});


test('Suite run() is function', () => {
    const suite = new Suite();
    assert.is_fun(suite.run);
});

test('Suite run() expects 2 arguments', () => {
    const suite = new Suite();
    assert.len(suite.run, 2);
});

test('Suite run() works with no arguments', () => {
    const suite = new Suite();
    return suite.run();
});

test('Suite run() returns promise', () => {
    const suite = new Suite();
    assert.is_true(typeof suite.run().then === 'function');
});

test('Suite run() throws on unknown target', () => {
    const suite = new Suite();
    assert.throws(() => {
        suite.run('a');
    }, /unknown target/);
});

test('Suite run() throws on unknown target - array', () => {
    const suite = new Suite();
    assert.throws(() => {
        suite.run(['a']);
    }, /unknown target/);
});

test('Suite run() single target', () => {
    const fna = sinon.spy();
    const suite = new Suite();
    suite.target('a').task(fna);
    return suite.run('a').then(() => {
        assert.is_true(fna.calledOnce);
    });
});

test('Suite run() multiple targets', () => {
    const fna = sinon.spy();
    const fnb = sinon.spy();
    const suite = new Suite();
    suite.target('a').task(fna);
    suite.target('b', ['a']).task(fnb);
    return suite.run('a').then(() => {
        assert.is_true(fna.calledOnce);
        assert.is_false(fnb.called);
    });
});

test('Suite run() multiple targets with dep resolution', () => {
    const fna = sinon.spy();
    const fnb = sinon.spy();
    const suite = new Suite();
    suite.target('a').task(fna);
    suite.target('b', ['a']).task(fnb);
    return suite.run('b').then(() => {
        assert.is_true(fna.calledOnce);
        assert.is_true(fnb.calledOnce);
        assert.is_true(fna.calledBefore(fnb));
    });
});

test('Suite run() default target - no targets', () => {
    const fna = sinon.spy();
    const suite = new Suite();
    suite.defaults('a');
    suite.target('a').task(fna);
    return suite.run().then(() => {
        assert.is_true(fna.calledOnce);
    });
});

test('Suite run() default target - empty array', () => {
    const fna = sinon.spy();
    const suite = new Suite();
    suite.defaults(['a']);
    suite.target('a').task(fna);
    return suite.run([]).then(() => {
        assert.is_true(fna.calledOnce);
    });
});

test('Suite run() error handling', () => {
    const fna = sinon.stub().throws('testerror');
    const fnb = sinon.spy();
    const suite = new Suite();
    suite.target('a').task(fna);
    suite.target('b', ['a']).task(fnb);
    return suite.run('a').catch(() => {
        assert.is_true(fna.calledOnce);
        assert.is_false(fnb.called);
    });
});

test('Suite run() error handling - deps', () => {
    const fna = sinon.spy();
    const fnb = sinon.stub().throws('testerror');
    const suite = new Suite();
    suite.target('a').task(fna);
    suite.target('b', ['a']).task(fnb);
    return suite.run('b').catch(() => {
        assert.is_true(fna.calledOnce);
        assert.is_true(fnb.calledOnce);
        assert.is_true(fna.calledBefore(fnb));
    });
});

test('Suite run() reporter with multiple targets with dep resolution', () => {
    const reporter = {
        beforeSuite: sinon.spy(),
        afterSuite: sinon.spy(),
        onError: sinon.spy()
    };
    const fna = sinon.spy();
    const fnb = sinon.spy();
    const suite = new Suite();
    suite.target('a').task(fna);
    suite.target('b', ['a']).task(fnb);
    return suite.run('b', reporter).then(() => {
        assert.is_true(reporter.beforeSuite.calledOnce);
        assert.is_true(reporter.afterSuite.calledOnce);
        assert.is_false(reporter.onError.called);
        assert.is_true(fna.calledOnce);
        assert.is_true(fnb.calledOnce);

        assert.is_true(reporter.beforeSuite.calledBefore(fna));
        assert.is_true(fna.calledBefore(fnb));
        assert.is_true(fnb.calledBefore(reporter.afterSuite));
    });
});

test('Suite run() throws on circular dependencies', () => {
    const fna = sinon.spy();
    const fnb = sinon.spy();
    const suite = new Suite();
    suite.target('a', ['b']).task(fna);
    suite.target('b', ['a']).task(fnb);
    assert.throws(() => {
        return suite.run('b');
    }, /circular dependencies/);
});

test('Suite run() reporter with error', () => {
    const reporter = {
        beforeSuite: sinon.spy(),
        afterSuite: sinon.spy(),
        onError: sinon.spy()
    };
    const fna = sinon.stub().throws('testerror');
    const suite = new Suite();
    suite.target('a').task(fna);
    return suite.run('a', reporter).catch(() => {
        assert.is_true(reporter.beforeSuite.calledOnce);
        assert.is_false(reporter.afterSuite.called);
        assert.is_false(reporter.onError.called);
        assert.is_true(fna.calledOnce);

        assert.is_true(reporter.beforeSuite.calledBefore(fna));
    });
});

const insp = require('util').inspect;
const sinon = require('sinon');
const {test, assert} = require('scar');
const Reporter = require('../../lib/Reporter');


test('Reporter is function', () => {
    assert.is_fun(Reporter);
});

test('Reporter expects no arguments', () => {
    assert.len(Reporter, 0);
});

test('Reporter constructor without arguments', () => {
    const reporter = new Reporter();
    assert.match(reporter._prefix, /\[mkr\]/);
});


test('Reporter _formatArgs() is function', () => {
    const reporter = new Reporter();
    assert.is_fun(reporter._formatArgs);
});

test('Reporter _formatArgs() expects 1 argument', () => {
    const reporter = new Reporter();
    assert.len(reporter._formatArgs, 1);
});

[
    [undefined, ''],
    [{}, ''],
    [{a: 1}, 'a=1'],
    [{a: 1, b: 2}, 'a=1, b=2']
].forEach(x => {
    const arg = x[0];
    const exp = x[1];

    test('Reporter _formatArgs() ._formatArgs(' + insp(arg) + ')  ->  ' + insp(exp), () => {
        const reporter = new Reporter();
        assert.equal(reporter._formatArgs(arg), exp);
    });
});


test('Reporter _formatTargets() is function', () => {
    const reporter = new Reporter();
    assert.is_fun(reporter._formatTargets);
});

test('Reporter _formatTargets() expects 1 argument', () => {
    const reporter = new Reporter();
    assert.len(reporter._formatTargets, 1);
});

[
    [undefined, ''],
    [[], ''],
    [[{name: 'a'}], 'a'],
    [[{name: 'a'}, {name: 'b'}], 'a, b']
].forEach(x => {
    const arg = x[0];
    const exp = x[1];

    test('Reporter _formatTargets() ._formatTargets(' + insp(arg) + ')  ->  ' + insp(exp), () => {
        const reporter = new Reporter();
        assert.equal(reporter._formatTargets(arg), exp);
    });
});


test('Reporter _getTime() is function', () => {
    const reporter = new Reporter();
    assert.is_fun(reporter._getTime);
});

test('Reporter _getTime() expects no arguments', () => {
    const reporter = new Reporter();
    assert.len(reporter._getTime, 0);
});

test('Reporter _getTime() returns integer', () => {
    const reporter = new Reporter();
    const time = reporter._getTime();
    assert.is_num(time);
    assert.equal(time % 1, 0);
});


test('Reporter onError() is function', () => {
    const reporter = new Reporter();
    assert.is_fun(reporter.onError);
});

test('Reporter onError() expects 1 argument', () => {
    const reporter = new Reporter();
    assert.len(reporter.onError, 1);
});

test('Reporter onError() no argument', () => {
    const reporter = new Reporter();
    reporter.writeLine = sinon.spy();
    reporter.log = sinon.spy();

    assert.is_undef(reporter.onError());
    assert.is_true(reporter.writeLine.calledOnce);
    assert.is_true(reporter.log.calledOnce);
});

test('Reporter onError() string argument', () => {
    const reporter = new Reporter();
    reporter.writeLine = sinon.spy();
    reporter.log = sinon.spy();

    assert.is_undef(reporter.onError('test'));
    assert.is_true(reporter.writeLine.calledOnce);
    assert.is_true(reporter.log.calledOnce);
    assert.match(reporter.log.lastCall.args[0], /test/);
});

test('Reporter onError() object argument', () => {
    const reporter = new Reporter();
    reporter.writeLine = sinon.spy();
    reporter.log = sinon.spy();

    assert.is_undef(reporter.onError({}));
    assert.is_true(reporter.writeLine.calledOnce);
    assert.is_true(reporter.log.calledOnce);
    assert.match(reporter.log.lastCall.args[0], /object/);
});

test('Reporter onError() object argument with stack', () => {
    const reporter = new Reporter();
    reporter.writeLine = sinon.spy();
    reporter.log = sinon.spy();

    assert.is_undef(reporter.onError({stack: 'test'}));
    assert.is_true(reporter.writeLine.calledOnce);
    assert.is_true(reporter.log.calledOnce);
    assert.match(reporter.log.lastCall.args[0], /test/);
});

test('Reporter onError() no argument with time', () => {
    const reporter = new Reporter();
    reporter.writeLine = sinon.spy();
    reporter.log = sinon.spy();
    reporter._suiteTime = 1;

    assert.is_undef(reporter.onError());
    assert.is_true(reporter.writeLine.calledOnce);
    assert.is_true(reporter.log.calledTwice);
});


test('Reporter beforeSuite() is function', () => {
    const reporter = new Reporter();
    assert.is_fun(reporter.beforeSuite);
});

test('Reporter beforeSuite() expects 2 argument', () => {
    const reporter = new Reporter();
    assert.len(reporter.beforeSuite, 2);
});

test('Reporter beforeSuite() throws if no argument', () => {
    const reporter = new Reporter();
    reporter.log = sinon.spy();
    assert.throws(() => { reporter.beforeSuite(); });
});

test('Reporter beforeSuite() empty suite.args', () => {
    const reporter = new Reporter();
    reporter.log = sinon.spy();

    assert.is_undef(reporter.beforeSuite({args: {}}));
    assert.is_true(reporter.log.calledOnce);
});

test('Reporter beforeSuite() suite.args', () => {
    const reporter = new Reporter();
    reporter.log = sinon.spy();

    assert.is_undef(reporter.beforeSuite({args: {a: true}}));
    assert.is_true(reporter.log.calledOnce);
});

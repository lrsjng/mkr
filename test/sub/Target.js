const sinon = require('sinon');
const {test, assert} = require('scar');
const Target = require('../../lib/Target');
const Task = require('../../lib/Task');


test('Target is function', () => {
    assert.is_fun(Target);
});

test('Target expects 3 arguments', () => {
    assert.len(Target, 3);
});

test('Target constructor without arguments', () => {
    const target = new Target();

    assert.equal(target.name, 'unnamed');
    assert.deepEqual(target.dependencies, []);
    assert.deepEqual(target.description, '');
    assert.deepEqual(target._tasks, []);
});

test('Target constructor with arguments', () => {
    const obj1 = {};
    const obj2 = {};
    const obj3 = {};
    const target = new Target(obj1, obj2, obj3);

    assert.equal(target.name, obj1);
    assert.equal(target.dependencies, obj2);
    assert.equal(target.description, obj3);
    assert.deepEqual(target._tasks, []);
});


test('Target task() is function', () => {
    const target = new Target();
    assert.is_fun(target.task);
});

test('Target task() expects 1 argument', () => {
    const target = new Target();
    assert.len(target.task, 1);
});

test('Target task() chainable, returns this', () => {
    const target = new Target();
    assert.equal(target.task(), target);
});

test('Target task() without arguments', () => {
    const target = new Target();
    assert.deepEqual(target._tasks, []);
    assert.equal(target.task(), target);
    assert.deepEqual(target._tasks, [new Task()]);
});

test('Target task() with arguments', () => {
    const obj = {};
    const obj2 = {};
    const target = new Target();
    assert.deepEqual(target._tasks, []);
    assert.equal(target.task([obj, obj2]), target);
    assert.deepEqual(target._tasks, [new Task([obj, obj2])]);
});

test('Target task() multiple calls', () => {
    const obj = {};
    const obj2 = {};
    const target = new Target();
    assert.deepEqual(target._tasks, []);
    assert.equal(target.task([obj, obj2]), target);
    assert.deepEqual(target._tasks, [new Task([obj, obj2])]);
    assert.equal(target.task([obj]), target);
    assert.deepEqual(target._tasks, [new Task([obj, obj2]), new Task([obj])]);
    assert.equal(target.task(), target);
    assert.deepEqual(target._tasks, [new Task([obj, obj2]), new Task([obj]), new Task()]);
});


test('Target run() is function', () => {
    const target = new Target();
    assert.is_fun(target.run);
});

test('Target run() expects 1 argument', () => {
    const target = new Target();
    assert.len(target.run, 1);
});

test('Target run() returns Q promise', () => {
    const target = new Target();
    assert.is_true(typeof target.run().then === 'function');
});

test('Target run() runs tasks in sequence', () => {
    const fn1 = sinon.spy();
    const fn2 = sinon.spy();
    const fn3 = sinon.spy();
    const target = new Target();
    target.task(fn1);
    target.task(fn2);
    target.task(fn3);

    return target.run().then(() => {
        assert.is_true(fn1.calledOnce);
        assert.is_true(fn2.calledOnce);
        assert.is_true(fn3.calledOnce);
        assert.is_true(fn1.calledBefore(fn2));
        assert.is_true(fn2.calledBefore(fn3));
    });
});

test('Target run() runs reporter correct', () => {
    const reporter = {
        beforeTarget: sinon.spy(),
        afterTarget: sinon.spy()
    };
    const fn1 = sinon.spy();
    const fn2 = sinon.spy();
    const fn3 = sinon.spy();
    const target = new Target();
    target.task(fn1);
    target.task(fn2);
    target.task(fn3);

    return target.run(reporter).then(() => {
        assert.is_true(reporter.beforeTarget.calledOnce);
        assert.is_true(reporter.afterTarget.calledOnce);
        assert.is_true(fn1.calledOnce);
        assert.is_true(fn2.calledOnce);
        assert.is_true(fn3.calledOnce);

        assert.is_true(reporter.beforeTarget.calledBefore(fn1));
        assert.is_true(fn1.calledBefore(fn2));
        assert.is_true(fn2.calledBefore(fn3));
        assert.is_true(fn3.calledBefore(reporter.afterTarget));

        assert.deepEqual(reporter.beforeTarget.lastCall.args, [target]);
        assert.deepEqual(reporter.afterTarget.lastCall.args, []);
    });
});

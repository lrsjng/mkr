const sinon = require('sinon');
const {test, assert} = require('scar');
const Task = require('../../lib/Task');

const is_promise = x => x && typeof x.then === 'function';

function asyncFn(tracker, val) {
    return done => {
        setTimeout(() => {
            tracker.push(val);
            done();
        }, Math.random() * 20);
    };
}

function promisingFn(tracker, val) {
    return () => {
        return new Promise(resolve => {
            setTimeout(() => {
                tracker.push(val);
                resolve();
            }, Math.random() * 20);
        });
    };
}


test('Task is function', () => {
    assert.is_fun(Task);
});

test('Task expects 1 argument', () => {
    assert.len(Task, 1);
});

test('Task constructor without arguments', () => {
    const task = new Task();
    assert.deepEqual(task._fns, [undefined]);
});

test('Task constructor with argument', () => {
    const obj = {};
    const task = new Task(obj);
    assert.deepEqual(task._fns, [obj]);
});

test('Task constructor with arguments', () => {
    const obj = {};
    const obj2 = {};
    const task = new Task(obj, obj2);
    assert.deepEqual(task._fns, [obj]);
});


test('Task run() is function', () => {
    const task = new Task();
    assert.is_fun(task.run);
});

test('Task run() expects no arguments', () => {
    const task = new Task();
    assert.len(task.run, 0);
});

test('Task run() returns promise', () => {
    const task = new Task();
    assert.is_true(is_promise(task.run()));
});

test('Task run() single sync function', () => {
    const fn0 = sinon.spy();
    const task = new Task(fn0);
    const promise = task.run();

    assert.is_true(is_promise(promise));
    assert.is_true(fn0.calledOnce);
    assert.deepEqual(fn0.lastCall.args, []);
});

test('Task run() multiple sync functions', () => {
    const fn0 = sinon.spy();
    const fn1 = sinon.spy();
    const fn2 = sinon.spy();
    const task = new Task([fn0, fn1, fn2]);
    const promise = task.run();

    assert.is_true(is_promise(promise));
    assert.is_true(fn0.calledOnce);
    assert.deepEqual(fn0.lastCall.args, []);
    assert.is_true(fn1.calledOnce);
    assert.deepEqual(fn1.lastCall.args, []);
    assert.is_true(fn2.calledOnce);
    assert.deepEqual(fn2.lastCall.args, []);
    assert.is_true(fn2.calledOnce);
    assert.is_true(fn0.calledBefore(fn1));
    assert.is_true(fn0.calledBefore(fn2));
    assert.is_true(fn1.calledBefore(fn2));
});

test('Task run() single async functions', () => {
    const tracker = [];
    const fn0 = asyncFn(tracker, 0);
    const task = new Task(fn0);
    const promise = task.run();

    assert.is_true(is_promise(promise));
    assert.deepEqual(tracker, []);

    return promise.then(() => {
        assert.deepEqual(tracker, [0]);
    });
});

test('Task run() multiple async functions', () => {
    const tracker = [];
    const fn0 = asyncFn(tracker, 0);
    const fn1 = asyncFn(tracker, 1);
    const fn2 = asyncFn(tracker, 2);
    const fn3 = asyncFn(tracker, 3);
    const fn4 = asyncFn(tracker, 4);
    const task = new Task([fn0, fn1, fn2, fn3, fn4]);
    const promise = task.run();

    assert.is_true(is_promise(promise));
    assert.deepEqual(tracker, []);

    return promise.then(() => {
        assert.deepEqual(tracker.sort(), [0, 1, 2, 3, 4]);
    });
});

test('Task run() single promising functions', () => {
    const tracker = [];
    const fn0 = promisingFn(tracker, 0);
    const task = new Task(fn0);
    const promise = task.run();

    assert.is_true(is_promise(promise));
    assert.deepEqual(tracker, []);

    return promise.then(() => {
        assert.deepEqual(tracker, [0]);
    });
});

test('Task run() multiple promising functions', () => {
    const tracker = [];
    const fn0 = promisingFn(tracker, 0);
    const fn1 = promisingFn(tracker, 1);
    const fn2 = promisingFn(tracker, 2);
    const fn3 = promisingFn(tracker, 3);
    const fn4 = promisingFn(tracker, 4);
    const task = new Task([fn0, fn1, fn2, fn3, fn4]);
    const promise = task.run();

    assert.is_true(is_promise(promise));
    assert.deepEqual(tracker, []);

    return promise.then(() => {
        assert.deepEqual(tracker.sort(), [0, 1, 2, 3, 4]);
    });
});

'use strict';


var assert = require('chai').assert;
var q = require('q');
var sinon = require('sinon');
var Task = require('../lib/Task');

function asyncFn(tracker, val) {

    return function (done) {

        setTimeout(function () {

            tracker.push(val);
            done();
        }, Math.random() * 20);
    };
}

function promisingFn(tracker, val) {

    return function () {

        var deferred = q.defer();

        setTimeout(function () {

            tracker.push(val);
            deferred.resolve();
        }, Math.random() * 20);

        return deferred.promise;
    };
}


describe('Task', function () {

    it('is function', function () {

        assert.isFunction(Task);
    });

    it('expects 1 argument', function () {

        assert.lengthOf(Task, 1);
    });

    it('constructor without arguments', function () {

        var task = new Task();
        assert.deepEqual(task._fns, [undefined]);
    });

    it('constructor with argument', function () {

        var obj = {};
        var task = new Task(obj);
        assert.deepEqual(task._fns, [obj]);
    });

    it('constructor with arguments', function () {

        var obj = {};
        var obj2 = {};
        var task = new Task(obj, obj2);
        assert.deepEqual(task._fns, [obj]);
    });


    describe('.run()', function () {

        it('is function', function () {

            var task = new Task();
            assert.isFunction(task.run);
        });

        it('expects no arguments', function () {

            var task = new Task();
            assert.lengthOf(task.run, 0);
        });

        it('returns Q promise', function () {

            var task = new Task();
            assert.isTrue(q.isPromise(task.run()));
        });

        it('single sync function', function () {

            var fn0 = sinon.spy();
            var task = new Task(fn0);
            var promise = task.run();

            assert.isTrue(q.isPromise(promise));
            assert.isTrue(fn0.calledOnce);
            assert.deepEqual(fn0.lastCall.args, []);
        });

        it('multiple sync functions', function () {

            var fn0 = sinon.spy();
            var fn1 = sinon.spy();
            var fn2 = sinon.spy();
            var task = new Task([fn0, fn1, fn2]);
            var promise = task.run();

            assert.isTrue(q.isPromise(promise));
            assert.isTrue(fn0.calledOnce);
            assert.deepEqual(fn0.lastCall.args, []);
            assert.isTrue(fn1.calledOnce);
            assert.deepEqual(fn1.lastCall.args, []);
            assert.isTrue(fn2.calledOnce);
            assert.deepEqual(fn2.lastCall.args, []);
            assert.isTrue(fn2.calledOnce);
            assert.isTrue(fn0.calledBefore(fn1));
            assert.isTrue(fn0.calledBefore(fn2));
            assert.isTrue(fn1.calledBefore(fn2));
        });

        it('single async functions', function () {

            var tracker = [];
            var fn0 = asyncFn(tracker, 0);
            var task = new Task(fn0);
            var promise = task.run();

            assert.isTrue(q.isPromise(promise));
            assert.deepEqual(tracker, []);

            return promise.then(function () {

                assert.deepEqual(tracker, [0]);
            });
        });

        it('multiple async functions', function () {

            var tracker = [];
            var fn0 = asyncFn(tracker, 0);
            var fn1 = asyncFn(tracker, 1);
            var fn2 = asyncFn(tracker, 2);
            var fn3 = asyncFn(tracker, 3);
            var fn4 = asyncFn(tracker, 4);
            var task = new Task([fn0, fn1, fn2, fn3, fn4]);
            var promise = task.run();

            assert.isTrue(q.isPromise(promise));
            assert.deepEqual(tracker, []);

            return promise.then(function () {

                assert.deepEqual(tracker.sort(), [0, 1, 2, 3, 4]);
            });
        });

        it('single promising functions', function () {

            var tracker = [];
            var fn0 = promisingFn(tracker, 0);
            var task = new Task(fn0);
            var promise = task.run();

            assert.isTrue(q.isPromise(promise));
            assert.deepEqual(tracker, []);

            return promise.then(function () {

                assert.deepEqual(tracker, [0]);
            });
        });

        it('multiple promising functions', function () {

            var tracker = [];
            var fn0 = promisingFn(tracker, 0);
            var fn1 = promisingFn(tracker, 1);
            var fn2 = promisingFn(tracker, 2);
            var fn3 = promisingFn(tracker, 3);
            var fn4 = promisingFn(tracker, 4);
            var task = new Task([fn0, fn1, fn2, fn3, fn4]);
            var promise = task.run();

            assert.isTrue(q.isPromise(promise));
            assert.deepEqual(tracker, []);

            return promise.then(function () {

                assert.deepEqual(tracker.sort(), [0, 1, 2, 3, 4]);
            });
        });
    });
});

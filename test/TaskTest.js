/*jshint node: true */
/*global describe, before, beforeEach, it */
'use strict';


var assert = require('assert');
var q = require('q');
var Task = require('../lib/Task');


describe('Task', function () {

    before(function () {

    });

    beforeEach(function () {

    });

    it('is function', function () {

        assert.strictEqual(typeof(Task), 'function');
    });

    it('expects 1 argument', function () {

        assert.strictEqual(Task.length, 1);
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


    describe('#run', function () {

        it('is function', function () {

            var task = new Task();
            assert.strictEqual(typeof(task.run), 'function');
        });

        it('expects no arguments', function () {

            var task = new Task();
            assert.strictEqual(task.run.length, 0);
        });

        it('returns Q promise', function () {

            var task = new Task();
            assert.ok(q.isPromise(task.run()));
        });

        it('single sync function', function () {

            var tracker = [];
            var fn0 = function () { tracker.push(0); };
            var task = new Task(fn0);
            var promise = task.run();

            assert.ok(q.isPromise(promise));
            assert.deepEqual(tracker, [0]);
        });

        it('multiple sync functions', function () {

            var tracker = [];
            var fn0 = function () { tracker.push(0); };
            var fn1 = function () { tracker.push(1); };
            var fn2 = function () { tracker.push(2); };
            var fn3 = function () { tracker.push(3); };
            var fn4 = function () { tracker.push(4); };
            var task = new Task([fn0, fn1, fn2, fn3, fn4]);
            var promise = task.run();

            assert.ok(q.isPromise(promise));
            assert.deepEqual(tracker, [0, 1, 2, 3, 4]);
        });

        it('single async functions', function () {

            var tracker = [];
            var fn0 = function (done0) { setTimeout(function () { tracker.push(0); done0(); }, Math.random() * 20); };
            var task = new Task(fn0);
            var promise = task.run();

            assert.ok(q.isPromise(promise));
            assert.deepEqual(tracker, []);

            return promise.then(function () {

                assert.deepEqual(tracker, [0]);
            });
        });

        it('multiple async functions', function () {

            var tracker = [];
            var fn0 = function (done0) { setTimeout(function () { tracker.push(0); done0(); }, Math.random() * 20); };
            var fn1 = function (done1) { setTimeout(function () { tracker.push(1); done1(); }, Math.random() * 20); };
            var fn2 = function (done2) { setTimeout(function () { tracker.push(2); done2(); }, Math.random() * 20); };
            var fn3 = function (done3) { setTimeout(function () { tracker.push(3); done3(); }, Math.random() * 20); };
            var fn4 = function (done4) { setTimeout(function () { tracker.push(4); done4(); }, Math.random() * 20); };
            var task = new Task([fn0, fn1, fn2, fn3, fn4]);
            var promise = task.run();

            assert.ok(q.isPromise(promise));
            assert.deepEqual(tracker, []);

            return promise.then(function () {

                assert.deepEqual(tracker.sort(), [0, 1, 2, 3, 4]);
            });
        });
    });
});

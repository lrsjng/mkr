/*jshint node: true */
/*global describe, before, beforeEach, it */
'use strict';


var assert = require('assert');
var q = require('q');
var Target = require('../lib/Target');
var Task = require('../lib/Task');


describe('Target', function () {

    before(function () {

    });

    beforeEach(function () {

    });

    it('is function', function () {

        assert.strictEqual(typeof(Target), 'function');
    });

    it('expects 3 argument', function () {

        assert.strictEqual(Target.length, 3);
    });

    it('constructor without arguments', function () {

        var target = new Target();

        assert.strictEqual(target.name, 'unnamed');
        assert.deepEqual(target.dependencies, []);
        assert.deepEqual(target.description, '');
        assert.deepEqual(target._tasks, []);
    });

    it('constructor with arguments', function () {

        var obj1 = {};
        var obj2 = {};
        var obj3 = {};
        var target = new Target(obj1, obj2, obj3);

        assert.strictEqual(target.name, obj1);
        assert.deepEqual(target.dependencies, obj2);
        assert.deepEqual(target.description, obj3);
        assert.deepEqual(target._tasks, []);
    });


    describe('#task', function () {

        it('is function', function () {

            var target = new Target();
            assert.strictEqual(typeof(target.task), 'function');
        });

        it('expects 1 argument', function () {

            var target = new Target();
            assert.strictEqual(target.task.length, 1);
        });

        it('chainable, returns this', function () {

            var target = new Target();
            assert.strictEqual(target.task(), target);
        });

        it('without arguments', function () {

            var obj = {};
            var target = new Target();
            assert.deepEqual(target._tasks, []);
            assert.strictEqual(target.task([obj]), target);
            assert.deepEqual(target._tasks, [new Task([obj])]);
        });

        it('with arguments', function () {

            var obj = {};
            var obj2 = {};
            var target = new Target();
            assert.deepEqual(target._tasks, []);
            assert.strictEqual(target.task([obj, obj2]), target);
            assert.deepEqual(target._tasks, [new Task([obj, obj2])]);
        });

        it('multiple calls', function () {

            var obj = {};
            var obj2 = {};
            var target = new Target();
            assert.deepEqual(target._tasks, []);
            assert.strictEqual(target.task([obj, obj2]), target);
            assert.deepEqual(target._tasks, [new Task([obj, obj2])]);
            assert.strictEqual(target.task([obj]), target);
            assert.deepEqual(target._tasks, [new Task([obj, obj2]), new Task([obj])]);
            assert.strictEqual(target.task(), target);
            assert.deepEqual(target._tasks, [new Task([obj, obj2]), new Task([obj]), new Task()]);
        });
    });


    describe('#run', function () {

        it('is function', function () {

            var target = new Target();
            assert.strictEqual(typeof(target.run), 'function');
        });

        it('expects 1 argument', function () {

            var target = new Target();
            assert.strictEqual(target.run.length, 1);
        });

        it('returns Q promise', function () {

            var target = new Target();
            assert.ok(q.isPromise(target.run()));
        });
    });
});

/*jshint node: true */
/*global describe, before, beforeEach, it */


var _ = require('lodash');
var assert = require('assert');
var q = require('q');
var Target = require('../lib/Target');


describe('Target', function () {

    before(function () {

    });

    beforeEach(function () {

    });

    it('is function', function () {

        assert.ok(_.isFunction(Target));
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
});

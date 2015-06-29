'use strict';

var assert = require('chai').assert;
// var q = require('q');
// var sinon = require('sinon');
var Reporter = require('../../lib/Reporter');

describe('Reporter', function () {

    it('is function', function () {
        assert.isFunction(Reporter);
    });

    it('expects no arguments', function () {
        assert.lengthOf(Reporter, 0);
    });

    it('constructor without arguments', function () {
        var reporter = new Reporter();
        assert.match(reporter._prefix, /\[mkr\]/);
    });

    describe('._getTime()', function () {

        it('is function', function () {
            var reporter = new Reporter();
            assert.isFunction(reporter._getTime);
        });

        it('expects no arguments', function () {
            var reporter = new Reporter();
            assert.lengthOf(reporter._getTime, 0);
        });

        it('returns integer', function () {
            var reporter = new Reporter();
            var time = reporter._getTime();
            assert.isNumber(time);
            assert.strictEqual(time % 1, 0);
        });
    });
});

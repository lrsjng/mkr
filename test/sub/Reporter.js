'use strict';

var insp = require('util').inspect;
var assert = require('chai').assert;
var sinon = require('sinon');
var _ = require('lodash');
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

    describe('._formatArgs()', function () {

        it('is function', function () {
            var reporter = new Reporter();
            assert.isFunction(reporter._formatArgs);
        });

        it('expects 1 argument', function () {
            var reporter = new Reporter();
            assert.lengthOf(reporter._formatArgs, 1);
        });

        _.each([
            [undefined, ''],
            [{}, ''],
            [{a: 1}, 'a=1'],
            [{a: 1, b: 2}, 'a=1, b=2']
        ], function (x) {
            var arg = x[0];
            var exp = x[1];

            it('._formatArgs(' + insp(arg) + ')  ->  ' + insp(exp), function () {
                var reporter = new Reporter();
                assert.strictEqual(reporter._formatArgs(arg), exp);
            });
        });
    });

    describe('._formatTargets()', function () {

        it('is function', function () {
            var reporter = new Reporter();
            assert.isFunction(reporter._formatTargets);
        });

        it('expects 1 argument', function () {
            var reporter = new Reporter();
            assert.lengthOf(reporter._formatTargets, 1);
        });

        _.each([
            [undefined, ''],
            [[], ''],
            [[{name: 'a'}], 'a'],
            [[{name: 'a'}, {name: 'b'}], 'a, b']
        ], function (x) {
            var arg = x[0];
            var exp = x[1];

            it('._formatTargets(' + insp(arg) + ')  ->  ' + insp(exp), function () {
                var reporter = new Reporter();
                assert.strictEqual(reporter._formatTargets(arg), exp);
            });
        });
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

    describe('.onError()', function () {

        it('is function', function () {
            var reporter = new Reporter();
            assert.isFunction(reporter.onError);
        });

        it('expects 1 argument', function () {
            var reporter = new Reporter();
            assert.lengthOf(reporter.onError, 1);
        });

        it('no argument', function () {
            var reporter = new Reporter();
            reporter.writeLine = sinon.spy();
            reporter.log = sinon.spy();

            assert.isUndefined(reporter.onError());
            assert.isTrue(reporter.writeLine.calledOnce);
            assert.isTrue(reporter.log.calledOnce);
        });

        it('string argument', function () {
            var reporter = new Reporter();
            reporter.writeLine = sinon.spy();
            reporter.log = sinon.spy();

            assert.isUndefined(reporter.onError('test'));
            assert.isTrue(reporter.writeLine.calledOnce);
            assert.isTrue(reporter.log.calledOnce);
            assert.match(reporter.log.lastCall.args[0], /test/);
        });

        it('object argument', function () {
            var reporter = new Reporter();
            reporter.writeLine = sinon.spy();
            reporter.log = sinon.spy();

            assert.isUndefined(reporter.onError({}));
            assert.isTrue(reporter.writeLine.calledOnce);
            assert.isTrue(reporter.log.calledOnce);
            assert.match(reporter.log.lastCall.args[0], /object/);
        });

        it('object argument with stack', function () {
            var reporter = new Reporter();
            reporter.writeLine = sinon.spy();
            reporter.log = sinon.spy();

            assert.isUndefined(reporter.onError({stack: 'test'}));
            assert.isTrue(reporter.writeLine.calledOnce);
            assert.isTrue(reporter.log.calledOnce);
            assert.match(reporter.log.lastCall.args[0], /test/);
        });

        it('no argument with time', function () {
            var reporter = new Reporter();
            reporter.writeLine = sinon.spy();
            reporter.log = sinon.spy();
            reporter._suiteTime = 1;

            assert.isUndefined(reporter.onError());
            assert.isTrue(reporter.writeLine.calledOnce);
            assert.isTrue(reporter.log.calledTwice);
        });
    });

    describe('.beforeSuite()', function () {

        it('is function', function () {
            var reporter = new Reporter();
            assert.isFunction(reporter.beforeSuite);
        });

        it('expects 2 argument', function () {
            var reporter = new Reporter();
            assert.lengthOf(reporter.beforeSuite, 2);
        });

        it('throws if no argument', function () {
            var reporter = new Reporter();
            reporter.log = sinon.spy();
            assert.throws(function () { reporter.beforeSuite(); });
        });

        it('empty suite.args', function () {
            var reporter = new Reporter();
            reporter.log = sinon.spy();

            assert.isUndefined(reporter.beforeSuite({args: {}}));
            assert.isTrue(reporter.log.calledOnce);
        });

        it('suite.args', function () {
            var reporter = new Reporter();
            reporter.log = sinon.spy();

            assert.isUndefined(reporter.beforeSuite({args: {a: true}}));
            assert.isTrue(reporter.log.calledOnce);
        });
    });
});

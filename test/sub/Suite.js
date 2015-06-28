'use strict';

var assert = require('chai').assert;
var path = require('path');
var q = require('q');
var sinon = require('sinon');
var Suite = require('../../lib/Suite');
var Target = require('../../lib/Target');

describe('Suite', function () {

    it('is function', function () {
        assert.isFunction(Suite);
    });

    it('expects 1 argument', function () {
        assert.lengthOf(Suite, 1);
    });

    it('constructor without argument', function () {
        var suite = new Suite();

        assert.instanceOf(suite, Suite);
        assert.deepEqual(suite._targets, {});
        assert.deepEqual(suite._defaults, []);
        assert.deepEqual(suite.args, {});
    });

    it('constructor with argument', function () {
        var obj = {};
        var suite = new Suite(obj);

        assert.instanceOf(suite, Suite);
        assert.deepEqual(suite._targets, {});
        assert.deepEqual(suite._defaults, []);
        assert.deepEqual(suite.args, obj);
    });

    describe('.target()', function () {

        it('is function', function () {
            var suite = new Suite();
            assert.isFunction(suite.target);
        });

        it('expects 3 arguments', function () {
            var suite = new Suite();
            assert.lengthOf(suite.target, 3);
        });

        it('returns Target instance', function () {
            var suite = new Suite();
            assert.instanceOf(suite.target(), Target);
        });

        it('sets arguments correct', function () {
            var obj1 = {};
            var obj2 = {};
            var obj3 = {};
            var suite = new Suite();
            var target = suite.target(obj1, obj2, obj3);

            assert.strictEqual(target.name, obj1);
            assert.strictEqual(target.dependencies, obj2);
            assert.strictEqual(target.description, obj3);
            assert.deepEqual(target._tasks, []);
        });
    });

    describe('.defaults()', function () {

        it('is function', function () {
            var suite = new Suite();
            assert.isFunction(suite.defaults);
        });

        it('expects 1 argument', function () {
            var suite = new Suite();
            assert.lengthOf(suite.defaults, 1);
        });

        it('is chainable, returns this', function () {
            var suite = new Suite();
            assert.strictEqual(suite.defaults(), suite);
        });

        it('works with non-array argument', function () {
            var obj = {};
            var suite = new Suite();
            suite.defaults(obj);
            assert.deepEqual(suite._defaults, [obj]);
        });

        it('works with array argument', function () {
            var arr = [{}];
            var suite = new Suite();
            suite.defaults(arr);
            assert.deepEqual(suite._defaults, arr);
        });
    });

    describe('.include()', function () {

        it('is function', function () {
            var suite = new Suite();
            assert.isFunction(suite.include);
        });

        it('expects 1 argument', function () {
            var suite = new Suite();
            assert.lengthOf(suite.include, 1);
        });

        it('throws if no argument', function () {
            var suite = new Suite();
            assert.throws(function () {
                suite.include();
            }, TypeError);
        });

        it('throws non string argument', function () {
            var suite = new Suite();
            assert.throws(function () {
                suite.include(true);
            }, TypeError);
        });

        it('throws on file not found', function () {
            var suite = new Suite();
            assert.throws(function () {
                suite.include('unknown');
            }, /file not found/);
        });

        it('throws on file exports no function', function () {
            var suite = new Suite();
            assert.throws(function () {
                suite.include(path.join(__dirname, '../assets/empty.js'));
            }, /does not export a function/);
        });

        it('returns included filename', function () {
            var filename = path.join(__dirname, '../assets/fn.js');
            var suite = new Suite();
            var ret = suite.include(filename);
            assert.strictEqual(ret, filename);
        });
    });

    describe('.run()', function () {

        it('is function', function () {
            var suite = new Suite();
            assert.isFunction(suite.run);
        });

        it('expects 2 arguments', function () {
            var suite = new Suite();
            assert.lengthOf(suite.run, 2);
        });

        it('works with no arguments', function () {
            var suite = new Suite();
            return suite.run();
        });

        it('returns Q promise', function () {
            var suite = new Suite();
            assert.isTrue(q.isPromise(suite.run()));
        });

        it('throws on unknown target', function () {
            var suite = new Suite();
            assert.throws(function () {
                suite.run('a');
            }, /unknown target/);
        });

        it('throws on unknown target - array', function () {
            var suite = new Suite();
            assert.throws(function () {
                suite.run(['a']);
            }, /unknown target/);
        });

        it('single target', function () {
            var fna = sinon.spy();
            var suite = new Suite();
            suite.target('a').task(fna);
            return suite.run('a').then(function () {
                assert.isTrue(fna.calledOnce);
            });
        });

        it('multiple targets', function () {
            var fna = sinon.spy();
            var fnb = sinon.spy();
            var suite = new Suite();
            suite.target('a').task(fna);
            suite.target('b', ['a']).task(fnb);
            return suite.run('a').then(function () {
                assert.isTrue(fna.calledOnce);
                assert.isFalse(fnb.called);
            });
        });

        it('multiple targets with dep resolution', function () {
            var fna = sinon.spy();
            var fnb = sinon.spy();
            var suite = new Suite();
            suite.target('a').task(fna);
            suite.target('b', ['a']).task(fnb);
            return suite.run('b').then(function () {
                assert.isTrue(fna.calledOnce);
                assert.isTrue(fnb.calledOnce);
                assert.isTrue(fna.calledBefore(fnb));
            });
        });

        it('default target - no targets', function () {
            var fna = sinon.spy();
            var suite = new Suite();
            suite.defaults('a');
            suite.target('a').task(fna);
            return suite.run().then(function () {
                assert.isTrue(fna.calledOnce);
            });
        });

        it('default target - empty array', function () {
            var fna = sinon.spy();
            var suite = new Suite();
            suite.defaults(['a']);
            suite.target('a').task(fna);
            return suite.run([]).then(function () {
                assert.isTrue(fna.calledOnce);
            });
        });

        it('error handling', function () {
            var fna = sinon.stub().throws('testerror');
            var fnb = sinon.spy();
            var suite = new Suite();
            suite.target('a').task(fna);
            suite.target('b', ['a']).task(fnb);
            return suite.run('a').catch(function () {
                assert.isTrue(fna.calledOnce);
                assert.isFalse(fnb.called);
            });
        });

        it('error handling - deps', function () {
            var fna = sinon.spy();
            var fnb = sinon.stub().throws('testerror');
            var suite = new Suite();
            suite.target('a').task(fna);
            suite.target('b', ['a']).task(fnb);
            return suite.run('b').catch(function () {
                assert.isTrue(fna.calledOnce);
                assert.isTrue(fnb.calledOnce);
                assert.isTrue(fna.calledBefore(fnb));
            });
        });

        it('reporter with multiple targets with dep resolution', function () {
            var reporter = {
                    beforeSuite: sinon.spy(),
                    afterSuite: sinon.spy(),
                    onError: sinon.spy()
                };
            var fna = sinon.spy();
            var fnb = sinon.spy();
            var suite = new Suite();
            suite.target('a').task(fna);
            suite.target('b', ['a']).task(fnb);
            return suite.run('b', reporter).then(function () {
                assert.isTrue(reporter.beforeSuite.calledOnce);
                assert.isTrue(reporter.afterSuite.calledOnce);
                assert.isFalse(reporter.onError.called);
                assert.isTrue(fna.calledOnce);
                assert.isTrue(fnb.calledOnce);

                assert.isTrue(reporter.beforeSuite.calledBefore(fna));
                assert.isTrue(fna.calledBefore(fnb));
                assert.isTrue(fnb.calledBefore(reporter.afterSuite));
            });
        });

        it('throws on circular dependencies', function () {
            var fna = sinon.spy();
            var fnb = sinon.spy();
            var suite = new Suite();
            suite.target('a', ['b']).task(fna);
            suite.target('b', ['a']).task(fnb);
            assert.throws(function () {
                return suite.run('b');
            }, /circular dependencies/);
        });

        it('reporter with error', function () {
            var reporter = {
                    beforeSuite: sinon.spy(),
                    afterSuite: sinon.spy(),
                    onError: sinon.spy()
                };
            var fna = sinon.stub().throws('testerror');
            var suite = new Suite();
            suite.target('a').task(fna);
            return suite.run('a', reporter).catch(function () {
                assert.isTrue(reporter.beforeSuite.calledOnce);
                assert.isFalse(reporter.afterSuite.called);
                assert.isFalse(reporter.onError.called);
                assert.isTrue(fna.calledOnce);

                assert.isTrue(reporter.beforeSuite.calledBefore(fna));
            });
        });
    });
});

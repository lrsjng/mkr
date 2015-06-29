'use strict';

var insp = require('util').inspect;
var assert = require('chai').assert;
var path = require('path');
var _ = require('lodash');
// var q = require('q');
var sinon = require('sinon');
var Mkr = require('../../lib/Mkr');
var Reporter = require('../../lib/Reporter');

function MockStream() { this.clear(); }
MockStream.prototype.clear = function () { this.spy = sinon.spy(); this.content = ''; };
MockStream.prototype.write = function (sequence) { this.spy(sequence); this.content += sequence; };

var out = new MockStream();
var silentReporter = new Reporter();
silentReporter._stream = out;

describe('Mkr', function () {

    beforeEach(function () {
        out.clear();
    });

    it('is object', function () {
        assert.isObject(Mkr);
    });

    it('has the right properties', function () {
        assert.deepEqual(_.keys(Mkr).sort(), [
            'run',
            'clp',
            'cli'
        ].sort());
    });

    describe('.run()', function () {

        it('is function', function () {
            assert.isFunction(Mkr.run);
        });

        it('expects 1 argument', function () {
            assert.lengthOf(Mkr.run, 1);
        });

        it('throws on file not found', function () {
            return Mkr.run({
                file: path.join(__dirname, '../assets/none'),
                reporter: silentReporter
            }).catch(function (err) {
                assert.match(err, /file not found/);
                assert.match(out.content, /file not found/);
            });
        });

        it('throws on file not found - reporter', function () {
            return Mkr.run({
                file: path.join(__dirname, '../assets/none'),
                reporter: {}
            }).catch(function (err) {
                assert.match(err, /file not found/);
            });
        });

        it('throws on file not found', function () {
            return Mkr.run({
                reporter: silentReporter
            }).catch(function (err) {
                assert.match(err, /file not found/);
                assert.match(out.content, /file not found/);
            });
        });

        it('works', function () {
            return Mkr.run({
                file: path.join(__dirname, '../assets/mkrfile.js'),
                reporter: silentReporter
            }).then(function () {
                assert.match(out.content, /successful in \d\.\d+ seconds/);
            });
        });

        it('works', function () {
            return Mkr.run({
                file: path.join(__dirname, '../assets/mkrfile.js'),
                showTargets: true,
                reporter: silentReporter
            }).then(function () {
                assert.match(out.content, /file:.*\/assets\/mkrfile\.js[\s\S]+defaults: \[t2\]/);
            });
        });

        it('works', function () {
            return Mkr.run({
                file: path.join(__dirname, '../assets/mkrfile.js'),
                listTargets: true,
                reporter: silentReporter
            }).then(function () {
                assert.strictEqual(out.content, 't0\nt1\nt2\n');
            });
        });

        it('works', function () {
            return Mkr.run({
                file: path.join(__dirname, '../assets/mkrfile.js'),
                listDefaults: true,
                reporter: silentReporter
            }).then(function () {
                assert.strictEqual(out.content, 't2\n');
            });
        });
    });

    describe('.clp()', function () {

        it('is function', function () {
            assert.isFunction(Mkr.clp);
        });

        it('expects 1 argument', function () {
            assert.lengthOf(Mkr.clp, 1);
        });

        _.each([
            [undefined, {
                args: {},
                file: 'mkrfile.js',
                listDefaults: false,
                listTargets: false,
                showTargets: false,
                targets: []
            }],
            [[], {
                args: {},
                file: 'mkrfile.js',
                listDefaults: false,
                listTargets: false,
                showTargets: false,
                targets: []
            }],
            [['a'], {
                args: {},
                file: 'mkrfile.js',
                listDefaults: false,
                listTargets: false,
                showTargets: false,
                targets: ['a']
            }],
            [[':a'], {
                args: {a: true},
                file: 'mkrfile.js',
                listDefaults: false,
                listTargets: false,
                showTargets: false,
                targets: []
            }],
            [['a', ':b', 'b', ':a'], {
                args: {a: true, b: true},
                file: 'mkrfile.js',
                listDefaults: false,
                listTargets: false,
                showTargets: false,
                targets: ['a', 'b']
            }],
            [['-f', 'test'], {
                args: {},
                file: 'test',
                listDefaults: false,
                listTargets: false,
                showTargets: false,
                targets: []
            }],
            [['-t'], {
                args: {},
                file: 'mkrfile.js',
                listDefaults: false,
                listTargets: false,
                showTargets: true,
                targets: []
            }],
            [['-T'], {
                args: {},
                file: 'mkrfile.js',
                listDefaults: false,
                listTargets: true,
                showTargets: false,
                targets: []
            }],
            [['-D'], {
                args: {},
                file: 'mkrfile.js',
                listDefaults: true,
                listTargets: false,
                showTargets: false,
                targets: []
            }]
        ], function (x) {
            var arg = x[0];
            var exp = x[1];

            it('.clp(' + insp(arg) + ')', function () {
                if (_.isArray(arg)) {
                    arg.unshift('PRG');
                    arg.unshift('NODE');
                }
                var res = Mkr.clp(arg);
                assert.deepEqual(res, exp);
            });
        });
    });

    describe('.cli()', function () {

        it('is function', function () {
            assert.isFunction(Mkr.cli);
        });

        it('expects no arguments', function () {
            assert.lengthOf(Mkr.cli, 0);
        });
    });
});

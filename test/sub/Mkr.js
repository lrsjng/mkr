'use strict';

var assert = require('chai').assert;
// var q = require('q');
// var sinon = require('sinon');
var Mkr = require('../../lib/Mkr');

describe('Mkr', function () {

    it('is function', function () {
        assert.isFunction(Mkr);
    });

    it('expects 1 argument', function () {
        assert.lengthOf(Mkr, 1);
    });

    it('constructor without arguments', function () {
        var mkr = new Mkr();
        assert.deepEqual(mkr.settings, {});
    });

    describe('.run()', function () {

        it('is function', function () {
            var mkr = new Mkr();
            assert.isFunction(mkr.run);
        });

        it('expects no arguments', function () {
            var mkr = new Mkr();
            assert.lengthOf(mkr.run, 0);
        });

        // it('works', function () {
        //     var mkr = new Mkr();
        //     mkr.run();
        // });
    });

    describe(':cli()', function () {

        it('is function', function () {
            assert.isFunction(Mkr.cli);
        });

        it('expects no arguments', function () {
            assert.lengthOf(Mkr.cli, 0);
        });

        // it('works', function () {
        //     Mkr.cli();
        // });
    });
});

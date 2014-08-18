/*jshint node: true */
'use strict';


var q = require('q');


var Task = module.exports = function (fns) {

        this.fns = Array.isArray(fns) ? fns : [fns];
    };


Task.prototype.run = function () {

    return q.all(this.fns.map(function (fn) {

        if (typeof(fn) !== 'function') {
            return q();
        }

        if (fn.length) {
            return q.Promise(fn);
        }

        return q(fn());
    }));
};

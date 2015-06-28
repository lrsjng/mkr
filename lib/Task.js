'use strict';

function Task(fns) {
    this._fns = Array.isArray(fns) ? fns : [fns];
}
module.exports = Task;

Task.prototype.run = function () {
    var q = require('q');

    return q.all(this._fns.map(function (fn) {
        if (typeof fn !== 'function') {
            return q();
        }

        if (fn.length) {
            return q.Promise(fn);
        }

        return q(fn());
    }));
};

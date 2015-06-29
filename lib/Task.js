'use strict';

var _ = require('lodash');
var q = require('q');

function Task(fns) {
    this._fns = _.isArray(fns) ? fns : [fns];
}
module.exports = Task;

Task.prototype.run = function () {

    return q.all(this._fns.map(function (fn) {
        if (!_.isFunction(fn)) {
            return q();
        }

        if (fn.length) {
            return q.Promise(fn);
        }

        return q(fn());
    }));
};

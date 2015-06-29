'use strict';

var _ = require('lodash');

function Target(name, dependencies, description) {
    this.name = name || 'unnamed';
    this.dependencies = dependencies || [];
    this.description = description || '';
    this._tasks = [];
}
module.exports = Target;

Target.prototype.task = function (fns) {
    var Task = require('./Task');

    this._tasks.push(new Task(fns));
    return this;
};

Target.prototype.run = function (reporter) {
    var q = require('q');
    var target = this;

    return q()
        .then(function () {
            if (reporter && _.isFunction(reporter.beforeTarget)) {
                reporter.beforeTarget(target);
            }
        })
        .then(function () {
            var promise = q();

            _.each(target._tasks, function (task) {
                promise = promise.then(function () {
                    return task.run();
                });
            });

            return promise;
        })
        .then(function () {
            if (reporter && _.isFunction(reporter.afterTarget)) {
                reporter.afterTarget();
            }
        });
};

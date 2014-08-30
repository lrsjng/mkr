/*jshint node: true */
'use strict';


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

            if (reporter && typeof(reporter.beforeTarget) === 'function') {
                reporter.beforeTarget(target);
            }
        })
        .then(function () {

            var promise = q();

            target._tasks.forEach(function (task) {

                promise = promise.then(function () {

                    return task.run();
                });
            });

            return promise;
        })
        .then(function () {

            if (reporter && typeof(reporter.afterTarget) === 'function') {
                reporter.afterTarget();
            }
        });
};

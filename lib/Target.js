/*jshint node: true */
'use strict';


var q = require('q'),
	Task = require('./Task');


var Target = module.exports = function (name, dependencies, description) {

		this.name = name || 'unnamed-target';
		this.dependencies = dependencies || [];
		this.description = description || '';
		this._tasks = [];
	};


Target.prototype.task = function (fns) {

	this._tasks.push(new Task(fns));
	return this;
};


Target.prototype.run = function (reporter) {

	var target = this;

	return q()
		.then(function () {

			reporter.beforeTarget(target);
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

			reporter.afterTarget();
		});
};

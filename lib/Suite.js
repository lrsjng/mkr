/*jshint node: true */
'use strict';


var q = require('q'),
	Target = require('./Target'),

	resolveDeps = function (targets, names, stack) {

		stack = stack || [];

		var result = [];

		names.forEach(function (name) {

			if (!targets[name]) {
				throw 'unknown target: ' + name;
			} else if (stack.indexOf(name) >= 0) {
				throw 'circular dependencies: ' + stack.join(', ') + ' -> ' + name;
			}

			stack.push(name);
			targets[name].dependencies.forEach(function (dep) {

				result = result.concat(resolveDeps(targets, [dep], stack));
			});
			stack.pop();

			result.push(name);
		});

		return result.filter(function (name, idx) {

			return result.indexOf(name) === idx;
		});
	};


var Suite = module.exports = function () {

		this._targets = {};
		this._defaults = [];
	};


Suite.prototype.target = function (name, dependencies, description) {

	var target = new Target(name, dependencies, description);
	this._targets[name] = target;
	return target;
};


Suite.prototype.defaults = function (names) {

	this._defaults = Array.isArray(names) ? names : [names];
	return this;
};


Suite.prototype.run = function (names, reporter) {

	names = Array.isArray(names) ? names : [names];
	if (!names.length) {
		names = this._defaults;
	}

	var suite = this,
		targets = [];

	try {
		targets = resolveDeps(suite._targets, names).map(function (name) { return suite._targets[name]; });
	} catch (err) {
		reporter.onError(err);
		process.exit(1);
	}

	return q()
		.then(function () {

			reporter.beforeSuite(suite, targets);
		})
		.then(function () {

			var promise = q();

			targets.forEach(function (target) {

				promise = promise.then(function () {

					return target.run(reporter);
				});
			});

			return promise;
		})
		.then(function () {

			reporter.afterSuite();
		})
		.catch(function (err) {

			reporter.onError(err);
			process.exit(1);
		});
};

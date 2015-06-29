'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var q = require('q');
var Target = require('./Target');

function _resolveDeps(targets, names, stack) {
    stack = stack || [];
    var result = [];

    _.each(names, function (name) {
        if (!targets[name]) {
            throw 'unknown target: ' + name;
        } else if (_.contains(stack, name)) {
            throw 'circular dependencies: ' + stack.join(', ') + ' -> ' + name;
        }

        stack.push(name);
        _.each(targets[name].dependencies, function (dep) {
            result = result.concat(_resolveDeps(targets, [dep], stack));
        });
        stack.pop();

        result.push(name);
    });

    return _.uniq(result);
}

function Suite(args) {
    this._targets = {};
    this._defaults = [];
    this.args = args || {};
}
module.exports = Suite;

Suite.prototype.target = function (name, dependencies, description) {
    var target = new Target(name, dependencies, description);

    this._targets[name] = target;
    return target;
};

Suite.prototype.defaults = function (names) {
    this._defaults = _.isArray(names) ? names : [names];
    return this;
};

Suite.prototype.include = function (filepath) {

    filepath = path.resolve(filepath);

    if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile()) {
        throw 'file not found: "' + filepath + '"';
    }

    var fn = require(filepath);

    if (!_.isFunction(fn)) {
        throw 'does not export a function: "' + filepath + '"';
    }

    fn(this);

    return filepath;
};

Suite.prototype.run = function (names, reporter) {
    var suite = this;
    var targets = [];

    if (!names || !names.length) {
        names = this._defaults;
    } else if (!_.isArray(names)) {
        names = [names];
    }

    targets = _.map(_resolveDeps(suite._targets, names), function (name) {
        return suite._targets[name];
    });

    return q()
        .then(function () {
            if (reporter && _.isFunction(reporter.beforeSuite)) {
                reporter.beforeSuite(suite, targets);
            }
        })
        .then(function () {
            var promise = q();

            _.each(targets, function (target) {
                promise = promise.then(function () {
                    return target.run(reporter);
                });
            });

            return promise;
        })
        .then(function () {
            if (reporter && _.isFunction(reporter.afterSuite)) {
                reporter.afterSuite();
            }
        });
};

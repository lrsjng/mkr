/*jshint node: true */
'use strict';


function _resolveDeps(targets, names, stack) {

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

            result = result.concat(_resolveDeps(targets, [dep], stack));
        });
        stack.pop();

        result.push(name);
    });

    return result.filter(function (name, idx) {

        return result.indexOf(name) === idx;
    });
}


function Suite() {

    this._targets = {};
    this._defaults = [];
}
module.exports = Suite;


Suite.prototype.target = function (name, dependencies, description) {

    var Target = require('./Target');
    var target = new Target(name, dependencies, description);

    this._targets[name] = target;
    return target;
};


Suite.prototype.defaults = function (names) {

    this._defaults = Array.isArray(names) ? names : [names];
    return this;
};


Suite.prototype.include = function (filepath) {

    var fs = require('fs');
    var path = require('path');

    filepath = path.resolve(filepath);

    if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile()) {
        throw 'file not found: "' + filepath + '"';
    }

    var fn = require(filepath);

    if (typeof(fn) !== 'function') {
        throw 'does not export a function: "' + filepath + '"';
    }

    fn(this);

    return filepath;
};


Suite.prototype.run = function (names, reporter) {

    var q = require('q');
    var suite = this;
    var targets = [];

    names = Array.isArray(names) ? names : [names];
    if (!names.length) {
        names = this._defaults;
    }

    targets = _resolveDeps(suite._targets, names).map(function (name) { return suite._targets[name]; });

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

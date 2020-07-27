const fs = require('fs');
const path = require('path');
const Target = require('./Target');
const {is_fn, is_arr} = require('./util');

function _resolve_deps(targets, names, stack) {
    stack = stack || [];
    let result = [];

    names.forEach(name => {
        if (!targets[name]) {
            throw new Error('unknown target: ' + name);
        } else if (stack.includes(name)) {
            throw new Error('circular dependencies: ' + stack.join(', ') + ' -> ' + name);
        }

        stack.push(name);
        targets[name].dependencies.forEach(dep => {
            result = result.concat(_resolve_deps(targets, [dep], stack));
        });
        stack.pop();

        result.push(name);
    });

    return Array.from(new Set(result));
}

module.exports = class Suite {
    constructor(args) {
        this._targets = {};
        this._defaults = [];
        this.args = args || {};
    }

    target(name, dependencies, description) {
        const target = new Target(name, dependencies, description);

        this._targets[name] = target;
        return target;
    }

    defaults(names) {
        this._defaults = is_arr(names) ? names : [names];
        return this;
    }

    include(filepath) {
        filepath = path.resolve(filepath);

        if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile()) {
            throw new Error('file not found: "' + filepath + '"');
        }

        const fn = require(filepath);

        if (!is_fn(fn)) {
            throw new Error('does not export a function: "' + filepath + '"');
        }

        fn(this);

        return filepath;
    }

    run(names, reporter) {
        const self = this;
        let targets = [];

        if (!names || !names.length) {
            names = this._defaults;
        } else if (!is_arr(names)) {
            names = [names];
        }

        targets = Array.from(_resolve_deps(self._targets, names), name => self._targets[name]);

        return Promise.resolve()
            .then(() => {
                if (reporter && is_fn(reporter.beforeSuite)) {
                    reporter.beforeSuite(self, targets);
                }
            })
            .then(() => {
                let promise = Promise.resolve();

                targets.forEach(target => {
                    promise = promise.then(() => {
                        return target.run(reporter);
                    });
                });

                return promise;
            })
            .then(() => {
                if (reporter && is_fn(reporter.afterSuite)) {
                    reporter.afterSuite();
                }
            });
    }
};

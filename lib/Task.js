const {is_fn} = require('./util');

module.exports = class Task {
    constructor(fns) {
        this._fns = Array.isArray(fns) ? fns : [fns];
    }

    run() {
        return Promise.all(this._fns.map(fn => {
            if (!is_fn(fn)) {
                return Promise.resolve();
            }

            if (fn.length) {
                return new Promise(fn);
            }

            return Promise.resolve(fn());
        }));
    }
};

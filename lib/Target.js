const Task = require('./Task');
const {is_fn} = require('./util');

module.exports = class Target {
    constructor(name, dependencies, description) {
        this.name = name || 'unnamed';
        this.dependencies = dependencies || [];
        this.description = description || '';
        this._tasks = [];
    }

    task(fns) {
        this._tasks.push(new Task(fns));
        return this;
    }

    run(reporter) {
        const self = this;

        return Promise.resolve()
            .then(() => {
                if (reporter && is_fn(reporter.beforeTarget)) {
                    reporter.beforeTarget(self);
                }
            })
            .then(() => {
                let promise = Promise.resolve();

                self._tasks.forEach(task => {
                    promise = promise.then(() => task.run());
                });

                return promise;
            })
            .then(() => {
                if (reporter && is_fn(reporter.afterTarget)) {
                    reporter.afterTarget();
                }
            });
    }
};

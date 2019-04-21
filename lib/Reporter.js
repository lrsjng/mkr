const chalk = require('chalk');

module.exports = class Reporter {
    constructor() {
        this._stream = process.stdout;
        this._prefix = chalk.grey.bold('[mkr] ');
        this._suiteTime = null;
    }

    write(sequence) {
        this._stream.write(sequence || '');
    }

    writeLine(sequence) {
        this.write(sequence || '');
        this.write('\n');
    }

    log(sequence) {
        this.writeLine(this._prefix + sequence.replace(/\n/g, '\n' + this._prefix));
    }

    _getTime() {
        return new Date().getTime();
    }

    _formatTargets(targets) {
        return Array.from(targets || [], target => target.name).join(', ');
    }

    _formatArgs(args) {
        return Object.keys(args || {}).map(key => `${key}=${args[key]}`).join(', ');
    }

    onError(error) {
        this.writeLine();
        if (this._suiteTime) {
            const deltaTime = this._getTime() - this._suiteTime;
            this.log(chalk.red.bold(`failed after ${deltaTime / 1000} seconds`));
        }
        if (error && error.stack) {
            this.log(chalk.red.bold(error.stack));
        } else {
            this.log(chalk.red.bold(error));
        }
    }

    beforeSuite(suite, targets) {
        this._suiteTime = this._getTime();
        let strArgs = this._formatArgs(suite.args);
        if (strArgs) {
            strArgs = `  [${strArgs}]`;
        }
        this.log(chalk.cyan('starting:  ' + this._formatTargets(targets) + strArgs));
    }

    afterSuite() {
        const deltaTime = this._getTime() - this._suiteTime;
        this.writeLine();
        this.log(chalk.green.bold(`successful in ${deltaTime / 1000} seconds`));
    }

    beforeTarget(target) {
        this.writeLine();
        this.log(chalk.cyan.bold(target.name));
    }

    afterTarget() {
    }
};

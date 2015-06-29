'use strict';

var chalk = require('chalk');
var _ = require('lodash');

function Reporter() {
    this._stream = process.stdout;
    this._prefix = chalk.grey.bold('[mkr] ');
    this._suiteTime = null;
}
module.exports = Reporter;

Reporter.prototype.write = function (sequence) {
    this._stream.write(sequence || '');
};

Reporter.prototype.writeLine = function (sequence) {
    this.write(sequence || '');
    this.write('\n');
};

Reporter.prototype.log = function (sequence) {
    this.writeLine(this._prefix + sequence.replace(/\n/g, '\n' + this._prefix));
};

Reporter.prototype._getTime = function () {
    return new Date().getTime();
};

Reporter.prototype._formatTargets = function (targets) {
    return _.map(targets, function (target) {
        return target.name;
    }).join(', ');
};

Reporter.prototype._formatArgs = function (args) {
    return _.map(_.keys(args), function (key) {
        return key + '=' + args[key];
    }).join(', ');
};

Reporter.prototype.onError = function (error) {
    this.writeLine();
    if (this._suiteTime) {
        var deltaTime = this._getTime() - this._suiteTime;
        this.log(chalk.red.bold('failed after ' + (deltaTime / 1000) + ' seconds'));
    }
    if (error && error.stack) {
        this.log(chalk.red.bold(error.stack));
    } else {
        this.log(chalk.red.bold(error));
    }
};

Reporter.prototype.beforeSuite = function (suite, targets) {
    this._suiteTime = this._getTime();
    var strArgs = this._formatArgs(suite.args);
    if (strArgs) {
        strArgs = '  [' + strArgs + ']';
    }
    this.log(chalk.cyan('starting:  ' + this._formatTargets(targets) + strArgs));
};

Reporter.prototype.afterSuite = function () {
    var deltaTime = this._getTime() - this._suiteTime;
    this.writeLine();
    this.log(chalk.green.bold('successful in ' + (deltaTime / 1000) + ' seconds'));
};

Reporter.prototype.beforeTarget = function (target) {
    this.writeLine();
    this.log(chalk.cyan.bold(target.name));
};

Reporter.prototype.afterTarget = function () {
};

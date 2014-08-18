/*jshint node: true */
'use strict';


var chalk = require('chalk');


var Reporter = module.exports = function () {

        this._prefix = chalk.grey.bold('[mkr] ');
        this._suiteTime = null;
    };


Reporter.prototype._getTime = function () {

    return new Date().getTime();
};


Reporter.prototype._write = function (sequence) {

    process.stdout.write(this._prefix + sequence.replace(/\n/g, '\n' + this._prefix) + '\n');
};


Reporter.prototype.onError = function (error) {

    console.log('');
    if (this._suiteTime) {
        var deltaTime = this._getTime() - this._suiteTime;
        this._write(chalk.red.bold('failed after ' + (deltaTime / 1000) + ' seconds'));
    }
    this._write(chalk.red.bold(error));
};


Reporter.prototype.beforeSuite = function (suite, targets) {

    this._suiteTime = this._getTime();
    this._write(chalk.cyan('starting: ' + targets.map(function (target) {return target.name;}).join(', ')));
};


Reporter.prototype.afterSuite = function () {

    var deltaTime = this._getTime() - this._suiteTime;

    console.log('');
    this._write(chalk.green.bold('successful in ' + (deltaTime / 1000) + ' seconds'));
};


Reporter.prototype.beforeTarget = function (target) {

    console.log('');
    this._write(chalk.cyan.bold(target.name));
};


Reporter.prototype.afterTarget = function () {

};

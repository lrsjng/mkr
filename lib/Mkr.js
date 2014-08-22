/*jshint node: true */
'use strict';


var Mkr = module.exports = function () {};


Mkr.cli = function () {

    var _ = require('lodash');
    var chalk = require('chalk');
    var Suite = require('./Suite');
    var Reporter = require('./Reporter');
    var pkg = require('../package.json');

    var cli = require('commander')
                .version(pkg.version)
                .usage('[options] <target ...>')
                .option('-f, --file [mkrfile]', 'specify mkrfile [mkrfile.js]', 'mkrfile.js')
                .option('-t, --show-targets', 'show targets')
                .option('-T, --list-targets', 'list targets')
                .option('-D, --list-defaults', 'list default targets')
                .option('--no-color', 'disable colored output')
                .parse(process.argv);

    var suite = new Suite();
    var reporter = new Reporter();

    var filepath;

    chalk.enabled = cli.color;

    try {
        filepath = suite.include(cli.file);
    } catch (err) {
        reporter.onError(err);
        process.exit(1);
    }

    if (cli.showTargets) {
        var s = '';
        s += chalk.cyan('file: ' + filepath + '\n');
        s += chalk.cyan('defaults: [' + suite._defaults.join(', ') + ']\n');

        _.each(suite._targets, function (target) {

            s += '\n';
            s += chalk.cyan.bold(target.name);
            if (target.dependencies.length) {
                s += chalk.cyan('  ->  [' + target.dependencies.join(', ') + ']');
            }
            s += '\n';
            if (target.description) {
                s += chalk.grey(target.description + '\n');
            }
        });

        console.log(s);
        return;
    }

    if (cli.listTargets) {
        console.log(_.pluck(suite._targets, 'name').join('\n'));
        return;
    }

    if (cli.listDefaults) {
        console.log(suite._defaults.join('\n'));
        return;
    }

    return suite.run(cli.args, reporter);
};

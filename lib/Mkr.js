/*jshint node: true */
'use strict';


var Mkr = module.exports = function () {

    };


Mkr.load = function (filepath, suite, reporter) {

    var fs = require('fs'),
        path = require('path'),
        _ = require('lodash');

    filepath = path.resolve(filepath);

    try {
        if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile()) {
            throw 'file not found: "' + filepath + '"';
        }

        var fn = require(filepath);

        if (!_.isFunction(fn)) {
            throw 'does not export a function: "' + filepath + '"';
        }

        fn(suite);
    } catch (err) {
        reporter.onError(err);
        process.exit(1);
    }

    return filepath;
};


Mkr.cli = function () {

    var chalk = require('chalk'),
        _ = require('lodash'),

        Suite = require('./Suite'),
        Reporter = require('./Reporter'),
        pkg = require('../package.json'),

        cli = require('commander')
                .version(pkg.version)
                .usage('[options] <target ...>')
                .option('-f, --file [mkrfile]', 'specify mkrfile [mkrfile.js]', 'mkrfile.js')
                .option('-t, --show-targets', 'show targets')
                .option('-T, --list-targets', 'list targets')
                .option('-D, --list-defaults', 'list default targets')
                .option('--no-color', 'disable colored output')
                .parse(process.argv),

        suite = new Suite(),
        reporter = new Reporter(),

        filepath;


    chalk.enabled = cli.color;

    filepath = Mkr.load(cli.file, suite, reporter);

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

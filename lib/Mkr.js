/*jshint node: true */
'use strict';


function Mkr() {}
module.exports = Mkr;


Mkr.cli = function () {

    var chalk = require('chalk');
    var Suite = require('./Suite');
    var Reporter = require('./Reporter');
    var pkg = require('../package.json');

    var sepIdx = process.argv.indexOf('--');
    var mkrArgv = sepIdx >= 0 ? process.argv.slice(0, sepIdx) : process.argv;
    var suiteArgv = sepIdx >= 0 ? process.argv.slice(sepIdx + 1) : [];

    var cli = require('commander')
                .version(pkg.version)
                .usage('[options] <target ...>')
                .option('-f, --file [mkrfile]', 'specify mkrfile [mkrfile.js]', 'mkrfile.js')
                .option('-t, --show-targets', 'show targets')
                .option('-T, --list-targets', 'list targets')
                .option('-D, --list-defaults', 'list default targets')
                .parse(mkrArgv);

    var suite = new Suite(suiteArgv);
    var reporter = new Reporter();

    var filepath;

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

        Object.keys(suite._targets).forEach(function (key) {

            var target = suite._targets[key];

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
        console.log(Object.keys(suite._targets).join('\n'));
        return;
    }

    if (cli.listDefaults) {
        console.log(suite._defaults.join('\n'));
        return;
    }

    try {
        return suite.run(cli.args, reporter);
    } catch (err) {
        reporter.onError(err);
        process.exit(1);
    }
};

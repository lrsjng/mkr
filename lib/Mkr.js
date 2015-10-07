'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var Command = require('commander').Command;
var minimist = require('minimist');
var q = require('q');
var Suite = require('./Suite');
var Reporter = require('./Reporter');

var DEFAULTS = {
        file: 'mkrfile.js',
        showTargets: false,
        listTargets: false,
        listDefaults: false,
        args: {},
        targets: [],
        reporter: new Reporter()
    };

var mkr = {};
module.exports = mkr;

mkr.run = function (options) {
    var settings = _.extend({}, DEFAULTS, options);
    var suite = new Suite(settings.args);
    var reporter = settings.reporter;

    if (settings.useBabel) {
        reporter.log(chalk.cyan('using babel require hook'));
        require('babel/register');
    }

    return q().then(function () {
        var filepath = suite.include(settings.file);

        if (settings.showTargets) {
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

            reporter.writeLine(s);
            return;
        }

        if (settings.listTargets) {
            reporter.writeLine(_.keys(suite._targets).join('\n'));
            return;
        }

        if (settings.listDefaults) {
            reporter.writeLine(suite._defaults.join('\n'));
            return;
        }

        return suite.run(settings.targets, reporter);
    }).catch(function (err) {
        if (reporter && _.isFunction(reporter.onError)) {
            reporter.onError(err);
        }
        return q.reject(err);
    });
};

mkr.clp = function (argv) {
    var pkg = require('../package.json');
    var cli = new Command()
                .version(pkg.version)
                .usage('[options] <target ...>')
                .option('-f, --file [mkrfile]', 'specify mkrfile [mkrfile.js]', 'mkrfile.js')
                .option('-t, --show-targets', 'show targets')
                .option('-T, --list-targets', 'list targets')
                .option('-D, --list-defaults', 'list default targets')
                .option('-b, --babel', 'use babel to load mkrfile')
                .parse(argv || []);

    cli.args = minimist(cli.args.map(function (arg) { return arg.replace(/^:/, '--'); }), {boolean: true});
    cli.targets = cli.args._;
    delete cli.args._;
    return {
        file: cli.file,
        showTargets: !!cli.showTargets,
        listTargets: !!cli.listTargets,
        listDefaults: !!cli.listDefaults,
        useBabel: !!cli.babel,
        args: cli.args,
        targets: cli.targets
    };
};

// istanbul ignore next
mkr.cli = function () {
    var options = mkr.clp(process.argv);
    mkr.run(options).catch(function () {
        process.exit(1);
    });
};

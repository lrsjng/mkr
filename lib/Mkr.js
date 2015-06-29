'use strict';

function Mkr(options) {
    this.settings = options || {};
}
module.exports = Mkr;

Mkr.prototype.run = function () {
    var self = this;
    var chalk = require('chalk');
    var q = require('q');
    var Suite = require('./Suite');
    var Reporter = require('./Reporter');
    var suite = new Suite(self.settings.args);
    var reporter = new Reporter();

    return q().then(function () {
        var filepath = suite.include(self.settings.file || 'mkrfile.js');

        if (self.settings.showTargets) {
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

        if (self.settings.listTargets) {
            console.log(Object.keys(suite._targets).join('\n'));
            return;
        }

        if (self.settings.listDefaults) {
            console.log(suite._defaults.join('\n'));
            return;
        }

        return suite.run(self.settings.targets, reporter);
    }).catch(function (err) {
        if (reporter && typeof reporter.onError === 'function') {
            reporter.onError(err);
        }
        return q.reject(err);
    });
};

Mkr.cli = function () {
    var pkg = require('../package.json');
    var cli = require('commander')
                .version(pkg.version)
                .usage('[options] <target ...>')
                .option('-f, --file [mkrfile]', 'specify mkrfile [mkrfile.js]', 'mkrfile.js')
                .option('-t, --show-targets', 'show targets')
                .option('-T, --list-targets', 'list targets')
                .option('-D, --list-defaults', 'list default targets')
                .parse(process.argv);

    cli.args = require('minimist')(cli.args.map(function (arg) { return arg.replace(/^:/, '--'); }), {boolean: true});
    cli.targets = cli.args._;
    delete cli.args._;

    new Mkr(cli).run().catch(function () {
        process.exit(1);
    });
};

const chalk = require('chalk');
const Command = require('commander').Command;
const minimist = require('minimist');
const Suite = require('./Suite');
const Reporter = require('./Reporter');
const {is_fn} = require('./util');

const DEFAULTS = {
    file: 'mkrfile.js',
    showTargets: false,
    listTargets: false,
    listDefaults: false,
    args: {},
    targets: [],
    reporter: new Reporter()
};

const mkr = {};
module.exports = mkr;

mkr.run = options => {
    const settings = {...DEFAULTS, ...options};
    const suite = new Suite(settings.args);
    const reporter = settings.reporter;

    return Promise.resolve().then(() => {
        const filepath = suite.include(settings.file);

        if (settings.showTargets) {
            let s = '';
            s += chalk.cyan(`file: ${filepath}\n`);
            s += chalk.cyan(`defaults: [${suite._defaults.join(', ')}]\n`);

            Object.values(suite._targets).forEach(target => {
                s += '\n';
                s += chalk.cyan.bold(target.name);
                if (target.dependencies.length) {
                    s += chalk.cyan(`  ->  [${target.dependencies.join(', ')}]`);
                }
                s += '\n';
                if (target.description) {
                    s += chalk.grey(target.description + '\n');
                }
            });

            reporter.writeLine(s);
            return null;
        }

        if (settings.listTargets) {
            reporter.writeLine(Object.keys(suite._targets).join('\n'));
            return null;
        }

        if (settings.listDefaults) {
            reporter.writeLine(suite._defaults.join('\n'));
            return null;
        }

        return suite.run(settings.targets, reporter);
    }).catch(err => {
        if (reporter && is_fn(reporter.onError)) {
            reporter.onError(err);
        }
        return Promise.reject(err);
    });
};

mkr.clp = argv => {
    const pkg = require('../package.json');
    const cli = new Command()
        .version(pkg.version)
        .usage('[options] <target ...>')
        .option('-f, --file [mkrfile]', 'specify mkrfile [mkrfile.js]', 'mkrfile.js')
        .option('-t, --show-targets', 'show targets')
        .option('-T, --list-targets', 'list targets')
        .option('-D, --list-defaults', 'list default targets')
        .parse(argv || []);

    cli.args = minimist(cli.args.map(arg => arg.replace(/^:/, '--')), {boolean: true});
    cli.targets = cli.args._;
    Reflect.deleteProperty(cli.args, '_');
    return {
        file: cli.file,
        showTargets: !!cli.showTargets,
        listTargets: !!cli.listTargets,
        listDefaults: !!cli.listDefaults,
        args: cli.args,
        targets: cli.targets
    };
};

mkr.cli = () => {
    const options = mkr.clp(process.argv);
    mkr.run(options).catch(() => {
        process.exit(1); // eslint-disable-line no-process-exit
    });
};

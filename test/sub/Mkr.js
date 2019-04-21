const insp = require('util').inspect;
const path = require('path');
const {test, assert} = require('scar');
const Mkr = require('../../lib/Mkr');
const Reporter = require('../../lib/Reporter');


class MockStream {
    constructor() {
        this.content = '';
    }

    write(sequence) {
        this.content += sequence;
    }
}


test('Mkr is object', () => {
    assert.is_obj(Mkr);
});

test('Mkr has the right properties', () => {
    assert.deepEqual(Object.keys(Mkr).sort(), [
        'run',
        'clp',
        'cli'
    ].sort());
});


test('Mkr run() is function', () => {
    assert.is_fun(Mkr.run);
});

test('Mkr run() expects 1 argument', () => {
    assert.len(Mkr.run, 1);
});

test('Mkr run() throws on file not found', () => {
    const out = new MockStream();
    const rep = new Reporter();
    rep._stream = out;
    return Mkr.run({
        file: path.join(__dirname, '../assets/none'),
        reporter: rep
    }).catch(err => {
        assert.match(err, /file not found/);
        assert.match(out.content, /file not found/);
    });
});

test('Mkr run() throws on file not found - reporter', () => {
    return Mkr.run({
        file: path.join(__dirname, '../assets/none'),
        reporter: {}
    }).catch(err => {
        assert.match(err, /file not found/);
    });
});

test('Mkr run() throws on file not found', () => {
    const out = new MockStream();
    const rep = new Reporter();
    rep._stream = out;
    return Mkr.run({
        reporter: rep
    }).catch(err => {
        assert.match(err, /file not found/);
        assert.match(out.content, /file not found/);
    });
});

test('Mkr run() works', () => {
    const out = new MockStream();
    const rep = new Reporter();
    rep._stream = out;
    return Mkr.run({
        file: path.join(__dirname, '../assets/mkrfile.js'),
        reporter: rep
    }).then(() => {
        assert.match(out.content, /successful in \d\.\d+ seconds/);
    });
});

test('Mkr run() works', () => {
    const out = new MockStream();
    const rep = new Reporter();
    rep._stream = out;
    return Mkr.run({
        file: path.join(__dirname, '../assets/mkrfile.js'),
        showTargets: true,
        reporter: rep
    }).then(() => {
        assert.match(out.content, /file:.*\/assets\/mkrfile\.js[\s\S]+defaults: \[t2\]/);
    });
});

test('Mkr run() works', () => {
    const out = new MockStream();
    const rep = new Reporter();
    rep._stream = out;
    return Mkr.run({
        file: path.join(__dirname, '../assets/mkrfile.js'),
        listTargets: true,
        reporter: rep
    }).then(() => {
        assert.equal(out.content, 't0\nt1\nt2\n');
    });
});

test('Mkr run() works', () => {
    const out = new MockStream();
    const rep = new Reporter();
    rep._stream = out;
    return Mkr.run({
        file: path.join(__dirname, '../assets/mkrfile.js'),
        listDefaults: true,
        reporter: rep
    }).then(() => {
        assert.equal(out.content, 't2\n');
    });
});


test('Mkr clp() is function', () => {
    assert.is_fun(Mkr.clp);
});

test('Mkr clp() expects 1 argument', () => {
    assert.len(Mkr.clp, 1);
});

[
    // [undefined, {
    //     args: {},
    //     file: 'mkrfile.js',
    //     listDefaults: false,
    //     listTargets: false,
    //     showTargets: false,
    //     targets: []
    // }],
    [[], {
        args: {},
        file: 'mkrfile.js',
        listDefaults: false,
        listTargets: false,
        showTargets: false,
        targets: []
    }],
    [['a'], {
        args: {},
        file: 'mkrfile.js',
        listDefaults: false,
        listTargets: false,
        showTargets: false,
        targets: ['a']
    }],
    [[':a'], {
        args: {a: true},
        file: 'mkrfile.js',
        listDefaults: false,
        listTargets: false,
        showTargets: false,
        targets: []
    }],
    [['a', ':b', 'b', ':a'], {
        args: {a: true, b: true},
        file: 'mkrfile.js',
        listDefaults: false,
        listTargets: false,
        showTargets: false,
        targets: ['a', 'b']
    }],
    [['-f', 'test'], {
        args: {},
        file: 'test',
        listDefaults: false,
        listTargets: false,
        showTargets: false,
        targets: []
    }],
    [['-t'], {
        args: {},
        file: 'mkrfile.js',
        listDefaults: false,
        listTargets: false,
        showTargets: true,
        targets: []
    }],
    [['-T'], {
        args: {},
        file: 'mkrfile.js',
        listDefaults: false,
        listTargets: true,
        showTargets: false,
        targets: []
    }],
    [['-D'], {
        args: {},
        file: 'mkrfile.js',
        listDefaults: true,
        listTargets: false,
        showTargets: false,
        targets: []
    }]
].forEach(x => {
    const arg = x[0];
    const exp = x[1];

    test('Mkr clp() .clp(' + insp(arg) + ')', () => {
        if (Array.isArray(arg)) {
            arg.unshift('PRG');
            arg.unshift('NODE');
        }
        const res = Mkr.clp(arg);
        assert.deepEqual(res, exp);
    });
});


test('Mkr cli() is function', () => {
    assert.is_fun(Mkr.cli);
});

test('Mkr cli() expects no arguments', () => {
    assert.len(Mkr.cli, 0);
});

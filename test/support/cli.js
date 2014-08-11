/* jshint expr: true */

/***
 * cli:
 * Helper for CLI tests.
 *
 *     var cli = require('...');
 *     cli.bin = './bin/hello';
 */

var exec = require('child_process').exec;

/**
 * result : cli.result
 * the result.
 *
 *     describe('help', function () {
 *       cli.run('--help');
 *
 *       it('works', function () {
 *         cli.result.code   => 0
 *         cli.result.error  => true/false
 *         cli.result.out    => "..." (stdout output)
 *         cli.result.stderr => "..." (stderr output)
 *       });
 *     });
 */

exports.result = {};


/**
 * bin : cli.bin
 * the bin to run.
 *
 *     var cli = require('...');
 *     cli.bin = './bin/hello';
 */

exports.bin = './bin/lol';

/**
 * run() : cli.run(cmd)
 * Runs a given command.
 *
 *   describe('running', function () {
 *     cli.run('--help');
 *     cli.success();
 *   });
 */

exports.run = function (args) {
  before(function (next) {
    exec(exports.bin + ' ' + args, function (_exit, _cout, _cerr) {
      exports.result.code = _exit && _exit.code || 0;
      exports.result.error = _exit;
      exports.result.out = _cout;
      exports.result.stripped = _cout.replace(/\033\[[^m]*m/g, '');
      exports.result.stderr = _cerr;
      next();
    });
  });

  after(function () {
    delete exports.result.code;
    delete exports.result.error;
    delete exports.result.out;
    delete exports.result.stripped;
    delete exports.result.stderr;
  });
};

/**
 * success() : cli.success()
 * asserts success
 *
 *   describe('running', function () {
 *     cli.run('--help');
 *     cli.success();
 *   });
 */

exports.success = function () {
  it('is successful', function () {
    expect(exports.result.code).eql(0);
    expect(exports.result.error).falsy;
  });
};

/**
 * pipe() : cli.pipe(input, args)
 * runs and pipes things into stdin
 *
 *   describe('pipes', function () {
 *     cli.pipe('var x = 2', ['--no-pager'])
 *     cli.success();
 *   });
 */

exports.pipe = function (input, args) {
  before(function (next) {
    var spawn = require('child_process').spawn;
    var child = spawn(exports.bin, args || [], { stdio: 'pipe' });
    exports.result.out = '';
    exports.result.stderr = '';

    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }

    child.stdout.on('data', function (data) { exports.result.out += data; });
    child.stderr.on('data', function (data) { exports.result.stderr += data; });
    child.on('close', function (code) {
      exports.result.code = code;
      next();
    });
  });

  after(function () {
    delete exports.result.out;
    delete exports.result.stderr;
  });
};

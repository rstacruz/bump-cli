require('./setup');
var cli = require('./support/cli');
cli.bin = './bin/bump';
var fs = require('fs');
var res = cli.result;

function tempfile() {
  return '/tmp/tmp' + Math.random();
}

describe('CLI: --help', function () {
  cli.run('--help');
  cli.success();

  it('prints the command name', function () {
    expect(res.out).match(/bump FILES/);
  });

  it('prints the command name', function () {
    expect(res.out).match(/bump FILES/);
  });
});

describe('CLI: --version', function () {
  cli.run('--version');
  cli.success();

  it('prints out the version', function () {
    expect(res.out).include(require('../package.json').version);
  });
});

// NB: this is sequential!
describe('working with files', function () {
  var fname = tempfile();

  before(function (next) {
    fs.writeFile(fname, 'VERSION = "2.2.0"\n', 'utf-8', next);
  });

  after(function (next) {
    fs.unlink(fname, next);
  });

  describe('invoking with --yes', function () {
    cli.run(fname + ' -y');
    cli.success();

    it('works', function () {
      var str = fs.readFileSync(fname, 'utf-8');
      expect(str).eql('VERSION = "2.2.1"\n');
    });
  });

  describe('invoking by default', function () {
    cli.pipe('y\n', [fname]);
    cli.success();

    it('prints a preview', function () {
      expect(res.stderr).match(/done!/);
      expect(res.stderr).include('2.2.2');
      expect(res.stderr).include('was 2.2.1');
      expect(res.stderr).match(/VERSION = .*2\.2\.2.*/);
    });

    it('updates the version', function () {
      var str = fs.readFileSync(fname, 'utf-8');
      expect(str).eql('VERSION = "2.2.2"\n');
    });
  });

  describe('invoking with --minor', function () {
    cli.run(fname + ' -m -y');
    cli.success();

    it('works', function () {
      var str = fs.readFileSync(fname, 'utf-8');
      expect(str).eql('VERSION = "2.3.0"\n');
    });
  });
});

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
    fs.writeFile(fname, 'VERSION = "1.0.0"\n', 'utf-8', next);
  });

  after(function (next) {
    fs.unlink(fname, next);
  });

  describe('invoking with -v', function () {
    cli.pipe('\n', [fname, '-v', '2.2.0']);
    cli.success();

    it('works', function () {
      var str = fs.readFileSync(fname, 'utf-8');
      expect(str).eql('VERSION = "2.2.0"\n');
    });

    it('produced preview output', function () {
      expect(res.stderr).match(/done!/);
      expect(res.stderr).include('2.2.0');
      expect(res.stderr).include('was 1.0.0');
      expect(res.stderr).match(/VERSION = .*2\.2\.0.*/);
    });
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
    cli.pipe('\n', [fname]);
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

  describe('aborting with "n"', function () {
    cli.pipe('n\n', [fname]);

    it('produces a non-zero exit', function () {
      expect(res.code).gt(0);
    });

    it('prints an aborted message', function () {
      expect(res.stderr).match(/cancelled/);
    });

    it('doesnt do anything', function () {
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

  describe('invoking with --quiet', function () {
    cli.run(fname + ' -q -v 2.2.0');
    cli.success();

    it('works', function () {
      var str = fs.readFileSync(fname, 'utf-8');
      expect(str).eql('VERSION = "2.2.0"\n');
    });

    it('produces no stderr', function () {
      expect(res.stderr).eql("");
    });
  });

  describe('invoking with a file without a version', function () {
    cli.run('bin/bump');

    it('produces a non-zero exit', function () {
      expect(res.code).gt(0);
    });

    it('produces stderr', function () {
      expect(res.stderr).match(/no version found/);
    });
  });

  describe('invoking with an invalid file', function () {
    cli.run('trololololol');

    it('produces a non-zero exit', function () {
      expect(res.code).gt(0);
    });

    it('produces stderr', function () {
      expect(res.stderr).match(/no such file/);
    });
  });
});

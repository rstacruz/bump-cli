require('./setup');

var ctx, src;
var Context = require('../index').Context;

describe('using with a multi-line gemspec', function () {
  beforeEach(function () {
    src = [
      "require 'rubygems'",
      "",
      "Gem.specification do |s|",
      "  s.version = '2.2.0'",
      "end"
    ].join('\n');
    ctx = new Context(src, "foo.gemspec");
  });

  it('finds the version', function () {
    expect(ctx.version).eql('2.2.0');
  });

  it('sets the new version', function () {
    expect(ctx.newVersion).eql('2.2.1');
  });

  it('gets the line before and after', function () {
    expect(ctx.lineBefore).eql("  s.version = '");
    expect(ctx.lineAfter).eql("'");
  });

  it('gets the before and after', function () {
    expect(ctx.before).eql("require 'rubygems'\n\nGem.specification do |s|\n");
    expect(ctx.after).eql("\nend");
  });

  it('reconstructs using toString()', function () {
    expect(ctx.toString()).eql(src.replace(/2.2.0/, '2.2.1'));
  });

  it('preview', function () {
    expect(ctx.preview()).have.length.gt(10);
  });

  it('finds source line', function () {
    expect(ctx.line).eql(4);
  });
});

describe('having the version on the first line', function () {
  beforeEach(function () {
    src = [
      "s.version = '2.2.0'",
      "end"
    ].join('\n');
    ctx = new Context(src);
  });

  it('finds the version', function () {
    expect(ctx.version).eql('2.2.0');
  });

  it('gets the line before and after', function () {
    expect(ctx.lineBefore).eql("s.version = '");
    expect(ctx.lineAfter).eql("'");
  });

  it('gets the before and after', function () {
    expect(ctx.before).eql("");
    expect(ctx.after).eql("\nend");
  });

  it('finds source line', function () {
    expect(ctx.line).eql(1);
  });
});

describe('having the version as the only line', function () {
  beforeEach(function () {
    src = [
      "<x version='2.2.0'/>"
    ].join('\n');
    ctx = new Context(src);
  });

  it('finds the version', function () {
    expect(ctx.version).eql('2.2.0');
  });

  it('gets the line before and after', function () {
    expect(ctx.lineBefore).eql("<x version='");
    expect(ctx.lineAfter).eql("'/>");
  });

  it('gets the before and after', function () {
    expect(ctx.before).eql("");
    expect(ctx.after).eql("");
  });

  it('finds source line', function () {
    expect(ctx.line).eql(1);
  });
});

describe('using different version schemes', function () {
  it('works with basic semver-style versions', function () {
    ctx = new Context("version=2.2.5");
    expect(ctx.version).eql('2.2.5');
  });

  it('works with prereleases', function () {
    ctx = new Context("version=2.2.5-pre3");
    expect(ctx.version).eql('2.2.5-pre3');
  });

  it('works with build IDs', function () {
    ctx = new Context("version=2.2.5+20140404");
    expect(ctx.version).eql('2.2.5+20140404');
  });

  it('works with prereleases and build IDs', function () {
    ctx = new Context("version=2.2.5-pre3+20140404");
    expect(ctx.version).eql('2.2.5-pre3+20140404');
  });
});

describe('xml', function () {
  it('ignores xml version strings', function () {
    ctx = new Context("<?xml version='1.0.0'?>\n<app version='2.0.4'>");
    expect(ctx.version).eql('2.0.4');
  });
});

describe('using with invalid files', function () {
  it('ignores invalid files', function () {
    ctx = new Context("holla");
    expect(ctx.valid).eql(false);
  });
});

describe('specifying an increment', function () {
  it('defaults to patch', function () {
    ctx = new Context("version=2.2.5");
    expect(ctx.newVersion).eql('2.2.6');
  });

  it('works with "minor"', function () {
    ctx = new Context("version=2.2.5", '', { inc: 'minor' });
    expect(ctx.newVersion).eql('2.3.0');
  });

  it('works with "preminor"', function () {
    ctx = new Context("version=2.2.5", '', { inc: 'preminor' });
    expect(ctx.newVersion).eql('2.3.0-0');
  });

  it('works with setting an explicit version', function () {
    ctx = new Context("version=2.2.5", '', { version: 'pancakes' });
    expect(ctx.newVersion).eql('pancakes');
    expect(ctx.toString()).eql('version=pancakes');
  });
});

require('./setup');

var ctx, src;
var Context = require('../index').Context;

describe('using with a multi-line gemspec', function () {
  beforeEach(function () {
    src = [
      "#rb",
      "",
      "Gem.specification do |s|",
      "  s.version = '2.2.0'",
      "end"
    ].join('\n');
    ctx = new Context(src);
  });

  it('finds the version', function () {
    expect(ctx.version).eql('2.2.0');
  });

  it('sets the new version', function () {
    expect(ctx.newVersion).eql('2.2.0');
  });

  it('gets the line before and after', function () {
    expect(ctx.lineBefore).eql("  s.version = '");
    expect(ctx.lineAfter).eql("'");
  });

  it('gets the before and after', function () {
    expect(ctx.before).eql("#rb\n\nGem.specification do |s|\n");
    expect(ctx.after).eql("\nend");
  });

  it('reconstructs', function () {
    expect(ctx.toString()).eql(src);
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

  it('sets the new version', function () {
    expect(ctx.newVersion).eql('2.2.0');
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

  it('sets the new version', function () {
    expect(ctx.newVersion).eql('2.2.0');
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

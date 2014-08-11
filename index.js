var Semver = require('semver');
var Matcher = require('./lib/matcher');

var expr = new Matcher({
  before: /([\s\S]*?)/,
  prefix: /([^\n]*version.*)/,
  trio: /\d+\.\d+\.\d+/,
  prerelease: /\-[a-z0-9]+/,
  build: /\+[a-z0-9]+/,
  after: /([^\n]*)([\s\S]*)/,
  regex: "^{before}{prefix}({trio}{prerelease}?{build}?){after}$"
}).compile('regex', 'mi');

function Context (src, options) {
  if (!options) options = {};
  this.src = src;

  if (options.version)
    this.newVersion = options.version;
  else
    this.inc = options.inc || 'patch';

  this.proc();
}
Context.prototype.proc = function () {
  var m = this.src.match(expr);
  if (m) {
    this.before = m[1];
    this.lineBefore = m[2];
    this.version = m[3];
    if (!this.newVersion)
      this.newVersion = Semver.inc(m[3], this.inc);
    this.lineAfter = m[4];
    this.after = m[5];
    this.line = this.before.split('\n').length;
  }
};

Context.prototype.toString = function () {
  return [
    this.before,
    this.lineBefore,
    this.version,
    this.lineAfter,
    this.after
  ].join("");
};

exports.Context = Context;

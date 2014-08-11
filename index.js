var Semver = require('semver');
var Matcher = require('./lib/matcher');

var expr = new Matcher({
  before: /([\s\S]*?)/,
  prefix: /([^\n]*(?!xml )version.*)/,
  trio: /\d+\.\d+\.\d+/,
  prerelease: /\-[a-z0-9]+/,
  build: /\+[a-z0-9]+/,
  after: /([^\n]*)([\s\S]*)/,
  regex: "^{before}{prefix}({trio}{prerelease}?{build}?){after}$"
}).compile('regex', 'mi');

/**
 * Context : new Context(src, options)
 * Represents a file with contents `src`.
 * Options are:
 *
 * ~ inc (String): what to increment (major, minor,
 *   patch, etc). Defaults to `patch`.
 * ~ version (String): what version to upgrade to.
 *   when this is set, `inc` is bypassed.
 *
 *     c = new Context("version = 2.2.5", "file.json", { inc: 'minor' })
 *     c.version     => "2.2.5"
 *     c.newVersion  => "2.3.0"
 *     c.toString()  => "version = 2.3.0"
 */

function Context (src, filename, options) {
  if (!options) options = {};
  this.src = src;
  this.filename = filename;

  if (options.version)
    this.newVersion = options.version;
  else
    this.inc = options.inc || 'patch';

  this.proc();
}

/**
 * proc():
 * (private) processes the source code (`src`)
 */

Context.prototype.proc = function () {
  var m = this.src.match(expr);
  if (m) {
    this.valid = true;
    this.before = m[1];
    this.lineBefore = m[2];
    this.version = m[3];
    if (!this.newVersion)
      this.newVersion = Semver.inc(m[3], this.inc);
    this.lineAfter = m[4];
    this.after = m[5];
    this.line = this.before.split('\n').length;
  } else {
    this.valid = false;
  }
};

/**
 * toString():
 * Reconstructs the source code using the new upgraded version number.
 */

Context.prototype.toString = function () {
  return [
    this.before,
    this.lineBefore,
    this.newVersion,
    this.lineAfter,
    this.after
  ].join("");
};


/**
 * preview():
 * (private) renders a console preview of changes to be done
 */

Context.prototype.preview = function () {
  this.lines = [];
  this.lines.push(c(1, this.filename));
  this.lines.push([
    '   ',
    c('30', this.line),
    ' ',
    this.lineBefore,
    c('32;4', this.newVersion),
    this.lineAfter,
    '  ',
    c('31', '(was ' + this.version + ')')
  ].join(""));
  return this.lines.join("\n");
};

function c (color, str) {
  return "\033["+color+"m"+str+"\033[0m";
}

exports.Context = Context;

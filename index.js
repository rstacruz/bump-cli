function Context(src) {
  this.src = src;
  this.proc();
}

Context.prototype.proc = function () {
  var m = this.src.match(
    /^([\s\S]*?)([^\n]*version.*)(\d+\.\d+\.\d+)([^\n]*)([\s\S]*)$/mi);
  if (m) {
    this.before = m[1];
    this.lineBefore = m[2];
    this.version = m[3];
    this.newVersion = m[3];
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

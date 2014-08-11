function Matcher (re) {
  this.re = re;
}

Matcher.prototype.compile = function (key, flags) {
  var self = this;
  var regexp = this.re[key];
  if (regexp.source) regexp = regexp.source;
  regexp = regexp.replace(/{(.*?)}/g, function (_, subkey) {
    return '(?:' + self.compile(subkey) + ')';
  });

  if (flags)
    return new RegExp(regexp, flags);
  else
    return regexp;
};

module.exports = Matcher;


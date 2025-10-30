import { SafeString } from 'handlebars';

// https://raw.githubusercontent.com/handlebars-lang/handlebars.js/864b721fef273eb7d182a21891059f5213675e89/lib/handlebars/utils.js

const badChars = /[&<>"'`=]/g,
  possible = /[&<>"'`=]/;

function escapeChar(chr: string) {
  switch (chr) {
    case '&':
      return '&amp;';
    case '<':
      return '&lt;';
    case '>':
      return '&gt;';
    case '"':
      return '&quot;';
    case "'":
      return '&#x27;';
    case '`':
      return '&#x60;';
    case '=':
      return '&#x3D;';
  }
  return '';
}

export function escapeExpression(string: string | SafeString) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

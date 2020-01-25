// some utils

function toBool(s: string | null) {
  if (!s) return false;
  switch (s.toLowerCase().trim()) {
    case 'true':
    case 'yes':
      return true;
    case 'false':
    case 'no':
    case '0':
    case null:
      return false;
    default:
      return Boolean(s);
  }
} // toBool()

function setTextContent(el: HTMLElement, txt: string) {
  if (el.textContent !== txt) el.textContent = txt;
} // setTextContent

function setAttr(el: HTMLElement, name: string, value: string) {
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
} // setAttr


/// Simple function for debouncing
/// reduce the # of function calls when initiating events trigger too often
/// by deferring the function execution.
function debounce(func: Function, wait: number = 20) {
  var timer: number;
  return function (this: any) {
    var scope: any = this;
    var args = arguments;

    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      timer = 0;
      func.apply(scope, args);
    }, wait);
  };
} // debounce()


// return actual parameters in hash part of URL as object
function getHashParams(defaults: object) {
  var params: any = { ...defaults };

  window.location.hash
    .substr(1)
    .split('&')
    .forEach(function (p) {
      var pa = p.split('=');
      params[pa[0]] = pa[1];
    });
  return params;
} // getHashParams()

// End

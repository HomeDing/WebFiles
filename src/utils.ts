// some utils


// convert a string to a boolean value where Boolean(v) doesn't cover everything.
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


// convert a string to a duration or time value from various formate into seconde.
function toSeconds(v: string): number {
  let ret: number = 0;
  v = v.toLowerCase();
  if (v.endsWith('h')) {
    ret = parseInt(v, 10) * 60 * 60;
  } else if (v.endsWith('m')) {
    ret = parseInt(v, 10) * 60;
  } else if (v.endsWith('s')) {
    ret = parseInt(v, 10);
  } else if (v.includes(':')) {
    ret = (Date.parse('1.1.1970 ' + v) - Date.parse('1.1.1970')) / 1000;
  } else {
    ret = Number(v);
  } // if
  return ret;
} // toSeconds()



function setTextContent(el: HTMLElement, txt: string) {
  if (el.textContent !== txt) el.textContent = txt;
} // setTextContent

function setAttr(el: HTMLElement, name: string, value: string) {
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
} // setAttr


/** change an element configuration in /config.json */ 
function changeConfig(id: string, newConfig: any) {
  const fName = '/config.json';
  const c = JSON.parse(hub.read('config'));
  let node = jsonFind(c, id);
  for (let n in newConfig) {
    if (newConfig[n]) {
      node[n] = newConfig[n];
    } else {
      delete node[n];
    }
  }

  var formData = new FormData();
  formData.append(fName, new Blob([JSON.stringify(c)], {type: 'text/html'}), fName);

  var objHTTP = new XMLHttpRequest();
  objHTTP.open('POST', '/');
  objHTTP.addEventListener('readystatechange', function () {
    if (this.readyState == 4 && this.status >= 200 && this.status < 300) {
      alert('saved.');
    } // if
  });
  objHTTP.send(formData);
} // changeConfig()



/** Simple function for debouncing.
 * reduce the # of function calls when initiating events trigger too often
 * by deferring the function execution. */
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

// some utils


// convert a string to a boolean value where Boolean(v) doesn't cover everything.
function toBool(s: string | null) {
  if (!s) { return false; }
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
  let ret = 0;
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
  if (el && (el.textContent !== txt)) { el.textContent = txt; }
} // setTextContent

function setAttr(el: HTMLElement, name: string, value: string) {
  if (el && (el.getAttribute(name) !== value)) { el.setAttribute(name, value); }
} // setAttr


/** change an element configuration in /config.json */
function changeConfig(id: string, newConfig: any) {
  let c: any, node: any, fName: string;

  fName = '/env.json';
  c = JSON.parse(hub.read('env'));
  node = jsonFind(c, id);

  if (!node) {
    // not a env configuration
    fName = '/config.json';
    c = JSON.parse(hub.read('config'));
    node = jsonLocate(c, id);
  }

  for (const n in newConfig) {
    const rn = Object.keys(node).find(e => (e.toLowerCase() === n.toLowerCase()));
    if (newConfig[n]) {
      node[rn || n] = newConfig[n];
    } else {
      delete node[n];
    }
  }

  const formData = new FormData();
  formData.append(fName, new Blob([JSON.stringify(c)], { type: 'text/html' }), fName);
  fetch('/', { method: 'POST', body: formData }).then(function() {
    window.alert('saved.');
  });
} // changeConfig()


/** Simple function for debouncing.
 * reduce the # of function calls when initiating events trigger too often
 * by deferring the function execution. */
function debounce(func: () => void, wait = 20) {
  let timer: number;
  return function() {
    if (timer) { clearTimeout(timer); }
    timer = window.setTimeout(() => {
      timer = 0;
      func();
    }, wait);
  };
} // debounce()


// /** This is a function level decorator.
//  *  As long as the function is called the execution is reduced to one execution only during timeout period.
//  */
// function throttle(timeout: number = 50): MethodDecorator {
//   return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     let timerID: number = 0;
//     const fFunc = descriptor.value;
//     descriptor.value = function (...args) {
//       if (!timerID) {
//         timerID = setTimeout(() => {
//           timerID = 0; fFunc.apply(this, args);
//         }, timeout);
//         fFunc.apply(this, args);
//       }
//     };
//     return descriptor;
//   };
// } // throttle()


// return actual parameters in hash part of URL as object
function getHashParams(defaults: object) {
  const params: any = { ...defaults };

  window.location.hash
    .substring(1)
    .split('&')
    .forEach(function(p) {
      const pa = p.split('=');
      params[pa[0]] = pa[1];
    });
  return params;
} // getHashParams()


function createHTMLElement(parentNode: HTMLElement, tag: string, attr: { [id: string]: string }, beforeNode: (HTMLElement | null) = null): HTMLElement {
  const o = document.createElement(tag);
  if (attr) {
    for (const a in attr) {
      o.setAttribute(a, attr[a]);
    }
  }
  if (parentNode) {
    if (beforeNode) {
      parentNode.insertBefore(o, beforeNode);
    } else {
      parentNode.appendChild(o);
    }
  }
  return (o);
} // createHTMLElement()

// initiate a fetch with JSON result expected.
async function fetchJSON(url:string, options: object) {
  const p = fetch(url, options)
    .then(raw => raw.json());
  return (p);
}

// initiate a fetch with Text result expected.
async function fetchText(url:string, options: object) {
  const p = fetch(url, options)
    .then(raw => raw.text());
  return (p);
}

// End

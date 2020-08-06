// === recursive JSON object parser
// Traverse / Scan a complex object and send all nodes with attributes to a receiver function. */

// See also:
// http://goessner.net/articles/JsonPath/

type JsonParseCallback = (path: string, key: string | null, value: string | null) => void;

function jsonParse(obj: any, cbFunc: JsonParseCallback) {
  /** internal function used in recursion */
  function _jsonParse(path: string, key: string, value: any) {
    let path2 = key ? path + '/' + key : path;
    path2 = path2.replace('/[', '[');

    if (Array.isArray(value)) {
      // traverse all entries in the array
      for (let n = 0; n < value.length; n++) {
        _jsonParse(path2, '[' + n + ']', value[n]);
      } // for
    } else if (typeof value === 'object') {
      // this is an attribute for the receiver function
      cbFunc(path2, null, null);

      // traverse all entries in the object
      Object.getOwnPropertyNames(value).forEach(k => _jsonParse(path2, k, value[k]));
    } else {
      // this is an attribute for the receiver function
      cbFunc(path, key, String(value));
    } // if
  } // _jsonParse()

  // start with root and scan recursively.
  _jsonParse('', '', obj);
} // jsonParse()

function jsonFind(obj: any, path: string): any {
  if (path[0] === '/') {
    path = path.substr(1);
  }
  const steps = path.split('/');

  // use existing objects.
  while (obj && steps.length > 0) {
    const p = steps[0];
    if (!obj[p]) {
      // create new object
      obj[p] = {};
    }
    obj = obj[p];
    steps.shift();
  } // while
  return obj;
} // jsonFind

// End.

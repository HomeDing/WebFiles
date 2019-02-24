// === recursive JSON object parser
// Traverse / Scan a complex object and send all nodes with attributes to a receiver function. */

interface JsonParseCallback {
  (path: string, key: string, value: string): void;
}


function jsonParse(obj:any, cbFunc: JsonParseCallback) {
  /** internal function used in recursion */
  function _jsonParse(path, key, value: any, cbFunc) {
    var path2 = key ? path + "/" + key : path;
    path2 = path2.replace("/[", "[");

    if (Array.isArray(value)) {
      // traverse all entries in the array
      for (var n = 0; n < value.length; n++) {
        _jsonParse(path2, "[" + n + "]", value[n], cbFunc);
      } // for
    } else if (typeof value == "object") {
      // this is an attribute for the receiver function
      cbFunc(path2, null, null);

      // traverse all entries in the object
      for (let n in value) {
        _jsonParse(path2, n, value[n], cbFunc);
      } // for
    } else {
      // this is an attribute for the receiver function
      cbFunc(path, key, String(value));
    } // if
  } // _jsonParse()

  // start with root and scan recursively.
  _jsonParse("", "", obj, cbFunc);
} // jsonParse()

// End.
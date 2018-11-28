// polyfill.js: Some polyfills
// requires browser that offers Promises or use polifill from 
// https://www.github.com/stefanpenner/es6-promise/

if (!window.fetch) {
  // only fetch with GET methond and URL ist supported. No init parameter.
  // The returned Result is supporting .text() and .json() only.
  window.fetch = function (url) {
    return new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            // Build object using a string with extensions.
            var res = {
              status: this.status,
              _text: this.responseText
            };
            res.text = function () {
              return (this._text)
            };
            res.json = function () {
              return (JSON.parse(this._text))
            };
            resolve(res);
          } else {
            reject(new Error('fetch: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
      xhr.send();
    });
  }
}

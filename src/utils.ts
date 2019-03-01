// some utils

function toBool(s: string) {
  if (!s) return false;
  switch (s.toLowerCase().trim()) {
    case "true":
    case "yes":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return Boolean(s);
  }
} // toBool()


function setTextContent(el:HTMLElement, txt:string) {
  if (el.textContent !== txt) el.textContent = txt;
} // setTextContent

function setAttr(el:HTMLElement, name:string, value:string) {
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
} // setAttr

// return actual parameters in hash part of URL as object
function getHashParams(defaults : object) {
  var params : object = {...defaults};

  window.location.hash
    .substr(1)
    .split("&")
    .forEach(function(p) {
      var pa = p.split("=");
      params[pa[0]] = pa[1];
    });
  return params;
} // getHashParams()

// End

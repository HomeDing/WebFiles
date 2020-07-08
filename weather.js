// Script for weather icon display with API

function _hideParts() {
  var parts = document.querySelectorAll('#parts > *');
  parts.forEach(function(p) {
    p.style.display = "none";
  })
}

function _updateParts(code) {
  var partNames = [];
  _hideParts();

  if ((code >= 200) && (code <= 299)) {
    partNames.push("cloud", "thunder");

  } else if ((code >= 300) && (code <= 399)) {
    partNames.push("cloud", "rain");

  } else if ((code >= 500) && (code <= 504)) {
    partNames.push("cloud", "rain", "partsun");

  } else if ((code >= 511) && (code <= 511)) {
    partNames.push("cloud", "snow");

  } else if ((code >= 520) && (code <= 599)) {
    partNames.push("cloud", "rain");

  } else if ((code >= 600) && (code <= 699)) {
    partNames.push("cloud", "snow");

  } else if ((code >= 700) && (code <= 799)) {
    partNames.push("cloud", "mist");

  } else if ((code >= 800) && (code <= 801)) {
    partNames.push("fullsun");

  } else if ((code >= 802) && (code <= 803)) {
    partNames.push("cloud", "partsun");

  } else if ((code >= 804) && (code <= 804)) {
    partNames.push("cloud");
  }

  partNames.forEach(function (n) {
    document.getElementById(n).style.display = "";
  })
} // _updateParts

_hideParts();

// test:
var code = 210;
if (location.hash.length > 0)
  code = Number(location.hash.substr(1));
_updateParts(code);


document['api'] = {
  update: _updateParts,
  hide: _hideParts
};

// End.

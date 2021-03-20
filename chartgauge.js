// Gauge-Chart micro charts implementation.
//
// Copyright (c) by Matthias Hertel, http://www.mathertel.de
// This work is licensed under a BSD 3-Clause license.
//
// * 01.02.2021 created. 

// SVG file must include microsvg.js
/// <reference path="microsvg.js" />

var RAD_OUT = 20;
var RAD_IN = 12;

var panelObj = document.getElementById("panel");
var valuesObj = document.getElementById("values");
var needleObj = document.getElementById("needle");

/**
 * Calculate an outer point on the circle, usable for svg paths
 */
function _piePoint(alpha, r) {
  var p = _cPoint(alpha, r);
  return (p.x + "," + p.y);
} // _piePoint()


function _drawSegment(start, end, color) {
  var alpha = Math.PI * (start - 0.5);
  var beta = Math.PI * (end - 0.5);
  var p = "";

  p += "M" + _piePoint(alpha, RAD_OUT);
  p += "A" + RAD_OUT + "," + RAD_OUT;
  p += " 0 0 1 ";
  p += _piePoint(beta, RAD_OUT);

  p += "L" + _piePoint(beta, RAD_IN);
  p += "A" + RAD_IN + "," + RAD_IN;
  p += " 0 0 0 ";
  p += _piePoint(alpha, RAD_IN);
  p += "Z";

  var pNode = createSVGNode(panelObj, "path", {
    class: "segment",
    style: "fill: " + color,
    d: p
  });
}


// expose API functions.
document['api'] = {
  setOptions: function (opts) {
    this.options = Object.assign({}, this.defaultOptions, opts);

    // set text
    document.querySelector('#title').textContent = this.options.title;
    document.querySelector('#minimum').textContent = this.options.minimum;
    document.querySelector('#maximum').textContent = this.options.maximum;
    document.querySelector('#units').textContent = this.options.units;

    // draw segments
    _removeChilds(panelObj);
    var r = (this.options.maximum - this.options.minimum);
    var v = this.options.minimum;
    this.options.segments.forEach(seg => {
      var h = seg.value || this.options.maximum;
      _drawSegment(
        (v - this.options.minimum) / r,
        (h - this.options.minimum) / r,
        seg.color);
      v = h;
    });
  }, // _setOptions()


  draw: function (value) {
    var valueObj = document.querySelector('#value');
    var v = Number(value);
    var r;

    if ((value == null) || isNaN(value)) {
      r = -20;
      valueObj.textContent = '';

    } else if (v < this.options.minimum) {
      r = -20;
      valueObj.textContent = value;

    } else if (v > this.options.maximum) {
      r = 200;
      valueObj.textContent = value;

    } else {
      // calc rotation
      r = 180 * (v - this.options.minimum) / (this.options.maximum - this.options.minimum);
      // set text
      valueObj.textContent = value;
    }

    // set needle
    var rotate = document.documentElement.createSVGTransform();
    rotate.setRotate(r, 0, 0);
    needleObj.transform.baseVal.replaceItem(rotate, 1);
  }, // _draw()  


  // Clear the output value. No value text, needle in outside position.
  clear: function () {
    this.draw(null);
  }, // _clear()

  defaultOptions: {
    segments: [
      {
        color: '#4040ff'
      }
    ]
  }
};

// End.
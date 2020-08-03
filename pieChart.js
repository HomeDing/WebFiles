// Pie-Chart Micro charts implementation.
// must include microsvg.js
//
// Copyright (c) by Matthias Hertel, http://www.mathertel.de
// This work is licensed under a BSD 3-Clause license.
//
// * 03.08.2020 include <title> for mouse over effect. 

var panelObj = document.getElementById("panel");
var RAD_OUT = 20;


/**
 * Calculate an outer point on the circle, usable for svg paths
 */
function _piePoint(alpha, r) {
  var s = " " + (Math.sin(alpha) * r) + "," + (Math.cos(alpha) * -r);
  return (s);
} // _piePoint()


/**
 * Append another pie slice inside inside the panelObj.
 */
function _addPieSlice(start, part, color, title) {
  var alpha = 2 * Math.PI * start;
  var beta = 2 * Math.PI * (start + part);

  var g = createSVGNode(panelObj, "g", null);
  createSVGNode(g, "title").textContent = title;

  // create pie slice path
  var p = "";
  p += "M" + _piePoint(alpha, RAD_OUT);
  p += "A" + RAD_OUT + "," + RAD_OUT;
  if (part < 0.5) {
    p += " 0 0 1 ";
  } else {
    p += " 0 1 1 ";
  }
  p += _piePoint(beta, RAD_OUT);
  p += "L" + " 0,0";
  p += "Z";
  createSVGNode(g, "path", {
    class: "segment",
    style: "fill:" + color,
    d: p
  });
} // _addPieSlice()


/** create a set of ranges for the pie chart panel in the background. The sum of all parts should add-up to 1.
 * @rangeList: List of pie chart segments. 
 */
function _setRange(rangeList) {
  if (rangeList) {
    // calculate sum:
    var sum = 0;
    for (var n = 0; n < rangeList.length; n++) {
      sum += rangeList[n].part;
    } // for

    var x = 0;
    for (var n = 0; n < rangeList.length; n++) {
      var p = rangeList[n].part / sum;
      _addPieSlice(x, p, rangeList[n].color, rangeList[n].title);
      x += p;
    } // for
  } // if
} // _setRange()


/**
 * Clear the pie chart.
 * Remove all elements inside the panelObj.
 */
function _clear() {
  while (panelObj.firstChild)
    panelObj.removeChild(panelObj.firstChild);
} // _clear()


// expose API functions.
document.api = {
  clear: _clear,
  setRange: _setRange
};

// End.
// Pie-Chart micro charts implementation.
// @file chartpie.js
//
// Copyright (c) by Matthias Hertel, http://www.mathertel.de
// This work is licensed under a BSD 3-Clause license.
//
// * 07.08.2020 show values optional. 

// SVG file must include microsvg.js
/// <reference path="microsvg.js" />

/**
 * Radius of pie chart
 */
var RAD_OUT = 20;

// expose API functions.
document['api'] = {
  options: {},
  _panelObj: document.getElementById("panel"),
  _valuesObj: document.getElementById("values"),

  /**
   * Calculate an outer point on the circle, usable for svg paths
   */
  _piePoint: function (alpha, r) {
    var p = _cPoint(alpha, r);
    return (p.x + "," + p.y);
  }, // _piePoint()


  /**
     * Append another pie slice inside inside the panelObj.
     * @param start start of slice in percent
     * @param size size of slice in percent
     * @param color color of slice
     * @param value value of slice to be shown
     * @param title description of slice to be shown
     */
  _addSlice: function (start, size, color, value, title) {
    var alpha = 2 * Math.PI * start;
    var beta = 2 * Math.PI * (start + size);
    var opts = this.options;

    // create pie slice path
    var p = "";
    p += "M" + this._piePoint(alpha, RAD_OUT);
    p += "A" + RAD_OUT + "," + RAD_OUT;
    if (size < 0.5) {
      p += " 0 0 1 ";
    } else {
      p += " 0 1 1 ";
    }
    p += this._piePoint(beta, RAD_OUT);
    p += "L0,0Z";
    var pNode = createSVGNode(this._panelObj, "path", {
      class: "segment",
      style: "fill:" + color,
      d: p
    });

    if ((opts.showTitle) || (opts.showValue) || (opts.showPercentage)) {
      var tvals = [];

      if (opts.showTitle) { tvals.push(String(title)); }
      if (opts.showValue) { tvals.push(Number(value).toLocaleString()); }
      if (opts.showPercentage) { tvals.push('(' + Math.round(size * 100) + '%)'); }

      // calc lightness of fill color
      var lum = window.getComputedStyle(pNode)
        .fill  // returns e.g. rgb(0, 0, 139)
        .match(/\d+/g)
        .reduce(function (s, e) { return (s + Number(e)) }, 0) / 3;


      // create text element on top of pie slice
      var tp = _cPoint((alpha + beta) / 2, RAD_OUT * 0.7);
      createSVGNode(this._valuesObj, "text", {
        class: "text",
        style: "fill:" + ((lum > 127) ? "black" : "white"),
        x: tp.x, y: tp.y
      }, tvals.join(' '));
    } // if
  }, // _addSlice()


  /**
     * Set chart options.
     * @param opts: Options to control the look of the chart. 
     */
  setOptions: function (opts) {
    this.options = Object.assign({}, this.defaultOptions, opts);
    if (opts.colors) {
      var cols = opts.colors;
      if (typeof cols == "string")
        this.options.colors = cols.split(',');
      else if (Array.isArray(cols))
        this.options.colors = [...cols];
    }
  },

  /**
   * Add additional chart elements: n/a.
   */
  add: function () { },


  /**
   * Create all slices from the given pie data.
   * @param data: Array of pie chart segment definitions. 
   */
  draw: function (data) {
    this.clear();
    this.options = Object.assign(this.defaultOptions, this.options);

    var cl = this.options.colors;
    var cll = this.options.colors.length

    if (data) {
      // calculate sum of all parts:
      var sum = data.reduce(function (x, e) { return (x + e.value); }, 0);

      data.reduce(function (start, el, indx) {
        var p = el.value / sum;
        var col = el.color || cl[indx % cll] || "gray";

        this._addSlice(start, p, col, el.value, el.title);
        return (start + p);
      }.bind(this), 0);
    } // if
  }, // _draw()


  /**
   * Clear the pie chart.
   * Remove all elements inside the panelObj.
   */
  clear: function () {
    _removeChilds(this._panelObj);
    _removeChilds(this._valuesObj);
  }, // clear()


  defaultOptions: {
    showTitle: false,
    showValue: false,
    showPercentage: false,
    colors: []
  }
};

// End.
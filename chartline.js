// Line-Chart micro charts implementation.
// @file chartline.js
//
// Copyright (c) by Matthias Hertel, http://www.mathertel.de
// This work is licensed under a BSD 3-Clause license.
//
// * 25.04.2020 improved vertical scaling 
// * 07.08.2020 show values optional. 
// * 21.03.2021 more flexibility in adding elements.
//   still limited to one line element. 'graphs[0]'; 

// SVG file must include microsvg.js
/// <reference path="microsvg.js" />

var panelObj = document.getElementById('panel');
var backObj = document.getElementById('background');
var indObj = document.getElementById('ind');

var redrawTimer = null;

// Region of data drawing
var REGION_WIDTH = 128;
var REGION_HEIGHT = 36;

/**
 * @typedef {Object} Point
 * @property {number} x - x pos of the point, may also be a date.valueOf
 * @property {number} y - y pos of the point
 */

/**
 * @typedef {Object} Box
 * @property {number} left
 * @property {number} right
 * @property {number} minY
 * @property {number} maxY
 */
/// left, top, right, bottom, x, y, width, height

/**
interface GraphsData {
  type: "line", "vAxis", "hLine"
  format: "..."
  data: Point[], number[], number;
  box: Box; // only if relevant data 
  redraw: boolean; // needs a redraw

  svgObj: SVGElement;
  fBox: function(box) { return(box) };
  fDraw: function(g){}
}
 */

// ===== Utilities

// calculate friendly steps and range
function _calcSteps(l, h) {
  var v = h - l;
  var range = Math.pow(10, Math.floor(Math.log10(v)));
  var ret = {};

  var step;
  if (v <= range * 2) {
    step = range / 2;
    // } else if (v <= range * 4) {
    //   step = range;
  } else if (v <= range * 5) {
    step = range;
  } else {
    step = 2 * range;
  }
  ret.high = Math.ceil(h / step) * step;
  ret.low = Math.floor(l / step) * step;
  ret.step = step;
  return (ret);
} // _calcSteps()


// list of the graphical elements in the chart.
// real data based charts must come before hLines and axis.
var graphs = [];

var minBox = { left: Infinity, right: -Infinity, minY: 0, maxY: 1 };
var displayBox = minBox;

// Data formatting
function fmtData(form, data) {
  var txt = data;
  var f = form.split(':');
  if (f[0] == 'num') {
    // convert to number with precision
    txt = String(data.toFixed(f[1] || 0));

  } else if (form == 'date') {
    // convert from ux timestamp (seconds since 1.1.1970) to date
    txt = (new Date(Number(data) * 1000)).toLocaleDateString();

  } else if (form == 'time') {
    // convert from ux timestamp (seconds since 1.1.1970) to time
    txt = (new Date(Number(data) * 1000)).toLocaleTimeString();

  } else if (form == 'datetime') {
    // convert from ux timestamp (seconds since 1.1.1970) to datetime
    txt = (new Date(Number(data) * 1000)).toLocaleString();

  } // if
  return txt;
} // fmtData


/** combine to boxes to a new box covering both. */
function outerBox(box1, box2) {
  var b = box1;

  if (!b) {
    b = box2;
  } else if (box2) {
    b = {
      left: Math.min(box1.left, box2.left),
      right: Math.max(box1.right, box2.right),
      minY: Math.min(box1.minY, box2.minY),
      maxY: Math.max(box1.maxY, box2.maxY)
    }
  }
  return (b);
} // outerBox()


/**
 * see if box1 and box2 are equal.
 * @param {Box} box1 
 * @param {Box} box2 
 * @returns {boolean} true when both boxes are equal.
 */
function boxEqual(box1, box2) {
  var result =
    (box1.minY === box2.minY)
    && (box1.maxY === box2.maxY)
    && (box1.left === box2.left)
    && (box1.right === box2.right);
  return (result);
} // boxEqual()


// ====== Line Charts

ChartLineClass = function (options) {
  var _defaultOptions = { linetype: 'line', color: 'black' };
  return {
    type: 'line',
    redraw: false,
    /** @type Point[] */
    data: null,
    options: Object.assign({}, _defaultOptions, options),
    svgObj: null,

    /**
     * Calculate outer box of an array of points.
     * @param {Point[]} points 
     */
    _calcBox: function (points) {
      /** @type Box */
      var box = null;

      if (points) {
        var xValues = points.map(function (p) { return p.x; });
        var yValues = points.map(function (p) { return p.y; });
        box = {
          left: Math.min(...xValues),
          right: Math.max(...xValues),
          minY: Math.min(...yValues),
          maxY: Math.max(...yValues)
        };
      }
      return (box);
    }, // _calcBox()

    /**
     * use the new values for drawing.
     * The real drawing is deferred and done in fDraw
     * @param {Point[]} values values as an array of points.
     */
    draw: function (values) {
      this.data = values;
      this.box = this._calcBox(values);
      this.redraw = true;
      _startRedraw();
    }, // draw

    clear: function () {
      if (this.svgObj) this.svgObj.remove();
    },

    fBox: function (box) {
      return (outerBox(box, this.box));
    },

    fDraw: function (box) {
      // remove existing line
      if (this.svgObj) this.svgObj.remove();

      var values = this.data;
      if (values) {
        var scaleX = 128 / (box.right - box.left);
        var scaleY = REGION_HEIGHT / (box.maxY - box.minY);
        var points = [];

        if (this.options.linetype == 'steps') {
          points = values.map(function (p, n) {
            return 'H' + (p.x - box.left) * scaleX + ' V' + (p.y - box.minY) * scaleY;
          });
          // starting point
          points[0] = "M" + (values[0].x - box.left) * scaleX + ',' + (values[0].y - box.minY) * scaleY;

        } else if (this.options.linetype == 'line') {
          points = values.map(function (p, n) {
            return (n > 0 ? 'L' : 'M') + (p.x - box.left) * scaleX + ',' + (p.y - box.minY) * scaleY;
          });

        } else if (this.options.linetype == 'bezier') {
          var p = values.map(function (p) {
            return ({ x: (p.x - box.left) * scaleX, y: (p.y - box.minY) * scaleY });
          });

          var cpLen = ((box.right - box.left) / values.length / 2) * scaleX;

          // opposite lines as deltas with length cpLen
          var ol = [];

          // opposite Line at start point [is 0/0
          ol.push({ dx: 0, dy: 0 });
          for (n = 1; n < values.length - 1; n++) {
            // calculate the opposite line, dx, dy
            var dx = (p[n + 1].x - p[n - 1].x);
            var dy = (p[n + 1].y - p[n - 1].y);
            var l = Math.sqrt(dx * dx + dy * dy);
            ol.push({ dx: cpLen * dx / l, dy: cpLen * dy / l });
          }
          // opposite Line at end point is 0/0
          ol.push({ dx: 0, dy: 0 });

          points.push('M' + p[0].x + ',' + p[0].y);
          for (n = 0; n < values.length - 1; n++) {
            // calculate the opposite line, dx, dy
            // var dx = (p[n+1].x - p[n-1].x) * cpLen;
            // var dy = (p[n+1].y - p[n-1].y) * cpLen;

            points.push('C' + (p[n].x + ol[n].dx) + ',' + (p[n].y + ol[n].dy)
              + ' ' + (p[n + 1].x - ol[n + 1].dx) + ',' + (p[n + 1].y - ol[n + 1].dy)
              + ' ' + p[n + 1].x + ',' + p[n + 1].y);
          }
        }

        var attr = {
          class: 'chartline',
          style: 'stroke:' + this.options.color,
          d: points.join('')
        };
        if (options.marker)
          attr['style'] += ';marker:url(#circle)';
        this.svgObj = createSVGNode(panelObj, 'path', attr);
      }
    } // fDraw()
  }
};


// ===== HLine horizontal lines =====

HLineClass = function (options) {
  options = Object.assign({ data: 0, color: 'black' }, options);
  return {
    type: "hLine",
    data: options.data,
    color: options.color,
    redraw: true,
    svgObj: null,

    fBox: function (box) {
      if (box) {
        box.minY = Math.min(this.data, box.minY);
        box.maxY = Math.max(this.data, box.maxY);
      }
      return (box);
    },

    fDraw: function (box) {
      this.clear();

      var scaleY = REGION_HEIGHT / (box.maxY - box.minY);
      var y = (this.data - box.minY) * scaleY;

      this.svgObj = createSVGNode(panelObj, 'line', {
        class: 'hline',
        style: 'stroke:' + this.color,
        x1: 0, y1: y,
        x2: 128, y2: y
      });
      this.redraw = false;
    }, // fDraw()

    clear: function () {
      if (this.svgObj) this.svgObj.remove();
      this.redraw = true;
    }
  }
};


// ===== Vertical Axis =====

VAxisClass = function () {
  return {
    type: "vAxis",
    redraw: true, // needs a redraw
    svgObj: document.querySelector('#v-labels'),

    fBox: function (box) {
      if (box) {
        var s = _calcSteps(box.minY, box.maxY);
        box.minY = s.low;
        box.maxY = s.high;
        this.step = s.step;
      }
      return (box);
    },

    fDraw: function (box) {
      this.clear();

      var high = box.maxY;
      var low = box.minY;
      var step = this.step;
      var prec = (step < 1) ? String(step).length - 2 : 0;

      var scaleY = REGION_HEIGHT / (high - low);

      for (var n = low; n <= high; n += step) {
        createSVGNode(this.svgObj, 'text', {
          x: 11, y: -1 * (n - low) * scaleY
        }, String(n.toFixed(prec)));
      }
      this.redraw = false;
    }, // fDraw()

    clear: function () {
      _removeChilds(this.svgObj);
      this.redraw = true;
    }
  }
};


// ===== Horizontal Axis =====

HAxisClass = function (options) {
  return {
    type: "hAxis",
    redraw: true, // needs a redraw
    options: Object.assign({ format: 'num', color: 'black' }, options),
    svgObj: document.querySelector('#h-labels'),

    fBox: function (box) {
      if (box) {
        var s = _calcSteps(box.left, box.right);
        box.left = s.low;
        box.right = s.high;
        this.step = s.step;
      }
      return (box);
    },

    fDraw: function (box) {
      this.clear();

      var high = box.right;
      var low = box.left;

      if (isFinite(low) && isFinite(high)) {
        var step = this.step;
        var prec = (step < 1) ? String(step).length - 2 : 0;
        var scale = REGION_WIDTH / (high - low);
        var f = this.options.format;
        if (f === 'num') { f = 'num:' + prec }

        for (var n = low; n <= high; n += step) {
          var txt = fmtData(this.options.format, n).split(',');
          createSVGNode(this.svgObj, 'text', {
            x: (n - low) * scale,
            y: 0,
            style: 'fill:' + this.options.color,
          }, txt[0]);
          if (txt[1]) {
            createSVGNode(this.svgObj, 'text', {
              x: (n - low) * scale,
              y: 3,
              style: 'fill:' + this.options.color,
            }, txt[1]);
          }

        }
      } // if
      this.redraw = false;
    }, // fDraw()

    clear: function () {
      _removeChilds(this.svgObj);
      this.redraw = true;
    }
  }
};


// ===== Indicator =====

IndicatorClass = function (options) {
  var _defaultOptions =
    { xFormat: 'num', yFormat: 'num' };

  return {
    type: 'indicator',
    redraw: false, // never needs redraw
    svgObj: document.querySelector('#ind'),
    options: Object.assign(_defaultOptions, options),

    fBox: function (box) { return (box); },
    fDraw: function (box) { }, // fDraw()
    clear: function () { },

    _setIndicator: function (box, data) {
      indObj.style.display = '';

      var oLine = indObj.querySelector('line');
      var oCircle = indObj.querySelector('circle');
      var oInfo = indObj.querySelector('.info');

      var xPos = ((data.x - box.left) * REGION_WIDTH) / (box.right - box.left);
      var yPos = (data.y - box.minY) * (REGION_HEIGHT / (box.maxY - box.minY));

      oLine.x1.baseVal.value = oLine.x2.baseVal.value = xPos;
      oCircle.cx.baseVal.value = xPos;
      oCircle.cy.baseVal.value = yPos;

      // calc infobox position
      xPos += xPos < REGION_WIDTH / 2 ? 2 : -20;
      yPos += yPos < REGION_HEIGHT / 2 ? 1 : -11;
      oInfo.setAttribute('transform', 'translate(' + xPos + ',' + yPos + ')');

      // add textual information
      var txtObjs = oInfo.querySelectorAll('text');
      txtObjs[0].textContent = fmtData(this.options.yFormat, data.y);
      var xTxt = fmtData(this.options.xFormat, data.x).split(',');
      txtObjs[1].textContent = xTxt[0];
      txtObjs[2].textContent = xTxt[1];
    }, // _setIndicator()


    display: function (evt) {
      var p = eventPoint(evt);
      var g = graphs[0];
      if (g) {
        var data = g.data;
        if (data && data.length) {
          var box = g.box;
          var xData = box.left + ((p.x - 12) * (box.right - box.left)) / REGION_WIDTH;

          // find nearest data by x
          var n = data.findIndex(function (e) {
            return e.x > xData;
          });

          if (n < 0) {
            n = data.length - 1;
          } else if (n > 0 && data[n].x - xData > xData - data[n - 1].x) {
            // check for the n-1 value maybe closer
            n = n - 1;
          }
          this._setIndicator(displayBox, data[n]);
        } // if
      } // if

    }
  }
};


// ===== Redraw =====

/** redraw graphs when required. */
function redraw() {
  // find out if dataBox has changed

  // combine all boxes to a new box covering both.
  var bx = graphs.reduce(function (box, graph) {
    return (graph.fBox(box));
  }, null);


  // has the displaybox changed because of new data ? 
  var doAll = (!boxEqual(bx, displayBox));
  displayBox = bx;

  graphs.forEach(function (g) {
    if ((doAll) || (g.redraw)) {
      g.fDraw(displayBox);
      g.redraw = false;
    } // if
  });

  redrawTimer = null;
} // redraw()

function _startRedraw() {
  if (!redrawTimer) redrawTimer = window.setTimeout(redraw, 20);
} // _startRedraw()

var indicator = null;


// ===== indicator mouse bindings

panelObj.addEventListener('mouseout', function () {
  indObj.style.display = 'none';
});

panelObj.addEventListener('mousemove', function (evt) {

  if (indicator) {
    indicator.display(evt);
  }
});


document['api'] = {
  options: {},

  setOptions: function (opts) { },

  /**
  * @param {string} type 
  * @param {Object} options 
   */
  add: function (type, options) {
    var newClass;
    var n = -1;
    var isData = false;

    if (Array.isArray(type)) {
      type.forEach(this.add.bind(this));

    } else if (typeof (type) == 'object') {
      this.add(type.type, type.options);

    } else {
      type = type.toLowerCase();
      options = Object.assign({}, options);

      if (type === 'line') {
        newClass = new ChartLineClass(options);
        isData = true;

      } else if (type == 'hline') {
        newClass = new HLineClass(options);

      } else if (type == 'vaxis') {
        newClass = new VAxisClass();

      } else if (type == 'haxis') {
        newClass = new HAxisClass(options);

      } else if (type == 'indicator') {
        newClass = new IndicatorClass(options);
        indicator = newClass;

      } else {
        debugger; // not implemented  

      }

      if (newClass) {
        if (isData) {
          n = Math.max(0, graphs.findIndex(function (g) { return g.type == 'line' }));
          graphs.splice(n, 0, newClass);
        } else {
          n = graphs.push(newClass) - 1;
        }
      } // if
    } // if
    return (n);
  }, // add


  draw: function (gID, values) {
    var g = graphs[gID] || graphs[0];
    if ((g) && (g.type === 'line')) {
      g.draw(values);
    }
  }, // draw()


  // remove all data and data bound graphs. 
  clear: function () {
    graphs.forEach(function (g) { g.clear(); });
    graphs = [];
    indicator = null;
  }, // clear()

  _defaultOptions: {}
};

// End.

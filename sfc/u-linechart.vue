<!--
Implementation of a web component for displaying a line chart.

The component displays ...

<u-linechart></u-linechart>

## HTML Attributes

The style of the web component can be changed.

## JavaScript accessible methods

* setOptions(opts) -- Set chart options.
* draw(value) -- Adjust the needle and the displayed value.

## Options

The options are used to configure the chart and are passed using the setOptions function.

* **fontSize** -- The size of the value shown as text. Default is '6px'.
* **strokeWidth** -- The with of the stroke drawing a border around a segment. Default is 0.2.
* **title** -- : 't',
* **minimum** -- : 'mi',
* **maximum** -- : 'ma',
* **units** -- : 'ut',
* **segments** -- : [ { color: '#4040ff' }]

-->

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 48">
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth"
        viewBox="0 0 20 20">
        <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
      </marker>
      <marker id="circle" markerWidth="4" markerHeight="4" refX="2" refY="2">
        <circle cx="2" cy="2" r="2" stroke="none" fill="#444444" />
      </marker>
    </defs>

    <g id="axis" transform="matrix(1,0,0,-1,0,48)">
      <line x1="12" y1="4" x2="12" y2="44" />
      <line x1="8" y1="8" x2="140" y2="8" />
    </g>

    <g id="v-labels" transform="matrix(1,0,0,-1,0,41)"></g>
    <g id="h-labels" transform="matrix(1,0,0,-1,12,44)"></g>

    <!-- region for the chartline is 136*40 starting in 0/0 -->
    <!-- <polyline marker-end="url(#arrow)" marker-start="url(#circle)" marker-mid="url(#circle)" /> -->
    <g id="panel" transform="matrix(1,0,0,-1,12,40)">
      <rect class="panel-back" width="128" height="36" />
    </g>

    <g id="ind" transform="matrix(1,0,0,-1,12,40)" style="display:none">
      <line x1="12" y1="0" x2="12" y2="36" />
      <circle cx="12" cy="8" r="1.2" />
      <g class="info" transform="translate(4, 12)">
        <rect class="back" width="18" height="10" />
        <text x="1" y="-7" id="indx"></text>
        <text x="1" y="-4" id="indV1"></text>
        <text x="1" y="-1" id="indV2"></text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
:host {
  display: inline-block;
  height: 120px;
  width: 360px;
  background-color: white;

  --fontSize: 3px;
  --strokeWidth: .2;
}

text {
  font-family: sans-serif;
}

#axis line {
  stroke: #008800;
  stroke-width: .2;
}

#panel path,
#panel line,
#panel polyline {
  stroke: black;
  stroke-width: 0.2;
  fill: none;
}

#panel line.hline {}

.panel-back {
  fill: #f8f8f8
}

#h-labels {
  text {
    transform: scale(1, -1);
    text-anchor: middle;
    font-size: 2.5px;
  }
}

#v-labels {
  text {
    transform: scale(1, -1);
    text-anchor: end;
    font-size: 2.5px;
  }

  line {
    stroke: #008800;
    stroke-width: .2;
  }
}


#ind {
  pointer-events: none;

  line {
    stroke: darkgreen;
    stroke-width: 0.2
  }

  circle {
    fill: none;
    stroke: darkgreen;
    stroke-width: 0.2
  }

  text {
    transform: scale(1, -1);
    text-anchor: start;
    font-size: 2.6px;
  }

  .info .back {
    fill: white;
    stroke: black;
    stroke-width: 0.1
  }
}
</style>

<script>

// Region of data drawing
const REGION_WIDTH = 128;
const REGION_HEIGHT = 36;

const TYPE_NUMERIC = 'num';
const TYPE_DATE = 'date';
const TYPE_TIME = 'time';
const TYPE_DATETIME = 'datetime';

/// Data Boxes are used to store range of a set of data points.

/**
 * @typedef {Object} Box
 * @property {number} left
 * @property {number} right
 * @property {number} minY
 * @property {number} maxY
 */

// class DataBox {
//   left = Infinity;
//   right = -Infinity;
//   minY = Infinity;
//   maxY = -Infinity;

//   constructor() {
//     this.left = Infinity;
//     this.right = -Infinity;
//     this.minY = Infinity;
//     this.maxY = -Infinity;
//   }

//   /** combine to boxes to a new box covering both. */
//   static outerBox(box1, box2) {
//     var b = box1;

//     if (!b) {
//       b = box2;
//     } else if (box2) {
//       b = {
//         left: Math.min(box1.left, box2.left),
//         right: Math.max(box1.right, box2.right),
//         minY: Math.min(box1.minY, box2.minY),
//         maxY: Math.max(box1.maxY, box2.maxY)
//       }
//     }
//     return (b);
//   } // outerBox()
// } // DataBox

const BOX_UNDEFINED = { left: Infinity, right: -Infinity, minY: Infinity, maxY: -Infinity };
// int16_t x_min;
//   int16_t y_min;
//   int16_t x_max;
//   int16_t y_max;

/** combine to boxes to a new box covering both. */
function outerBox(box1, box2) {
  // box1.extend(box2);
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


function boxIsValid(box) {
  return ((isFinite(box.left)) && (isFinite(box.right)) && (isFinite(box.minY)) && (isFinite(box.maxY)));
} // boxIsValid()


// ===== Utilities

/**
 * Calculate display-friendly range and steps for numeric ranges.
 * @param {number} l
 * @param {number} h
*/
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


/**
 * Calculate display-friendly range and steps for date ranges.
 * @param {number} l
 * @param {number} h
*/
function _calcDateSteps(l, h) {
  const day = (24 * 60 * 60);
  const tzOff = (new Date(0)).getTimezoneOffset() * 60;
  var step;
  var ret = {};
  var v = h - l;

  if ((v > day / 2) && (v < day)) {
    step = day / 4;
  } else if ((v > day) && (v < 2 * day)) {
    step = day / 2;
  } else if ((v > 2 * day) && (v < 6 * day)) {
    step = day;
  } else if ((v > 6 * day) && (v < 14 * day)) {
    step = 2 * day;
  } else {
    return (_calcSteps(l, h));
  }
  ret.high = Math.ceil(h / step) * step - tzOff;
  ret.low = Math.floor(l / step) * step + tzOff;
  ret.step = step;
  return (ret);
}; // _calcDateSteps()


/**
 * Create a SVG element
 * @param {SVGAElement} parentNode container node for the new element
 * @param {string} tagName tagName of the new element
 * @param {Object | undefined} attr attributes of the new element passed as Object 
 * @param {string | undefined} txt inner text content.   
 */
function createSVGNode(parentNode, tagName, attr, txt) {
  var n = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  if (attr) {
    Object.getOwnPropertyNames(attr).forEach(function(p) {
      n.setAttribute(p, attr[p]);
    });
  }
  if (txt) { n.textContent = txt; }
  parentNode.appendChild(n);
  return (n);
} // createSVGNode()

function _removeChilds(p) {
  Array.from(p.childNodes).forEach(function(c) {
    c.remove();
  });
} // _removeChilds()


// Type specific data formatting
function formatValue(type, value) {
  var txt = value;
  var f = type.split(':');
  var n = Number(value);

  if (f[0] == TYPE_NUMERIC) {
    // convert to number with precision
    txt = String(n.toFixed(f[1] || 0));

  } else if (type == TYPE_DATE) {
    // convert from ux timestamp (seconds since 1.1.1970) to date
    txt = (new Date(n * 1000)).toLocaleDateString('de');

  } else if (type == TYPE_TIME) {
    // convert from ux timestamp (seconds since 1.1.1970) to time
    txt = (new Date(n * 1000)).toLocaleTimeString('de');

  } else if (type == TYPE_DATETIME) {
    // convert from ux timestamp (seconds since 1.1.1970) to datetime
    txt = (new Date(n * 1000)).toLocaleString('de');

  } // if
  return (txt);
} // formatValue

// =====

class GraphBase {
  type = "base";
  hasData = false; // requires a dataset to be drawn

  /** data range corresponding to PANEL size for drawing */
  box;

  parentObj;
  drawObj;
  options = {};

  static compare(a, b) {
    if (a.hasData === b.hasData) return (0);
    if (a.hasData) return (-1);
    return (1);
  }

  constructor(parent) {
    this.parentObj = parent;
  }

  // change display options
  setOptions(opts) {
    this.options = Object.assign({}, this.options, opts);
  } // setOptions()


  // change data for data graphs
  setData(data) {
    if (!this.hasData) {
      debugger;
      console.error("cannot use data in non-data graphs");
    }
  } // setData()


  extendDataBox(box) {
    return (box);
  };

  clear() {
  }

  fDraw(box) {
    this.clear();
    this.box = box;
  }; // fDraw()
}; // GraphBase



// Horizontal Axis Class to create the labels for the horizontal axis. 
class HAxis extends GraphBase {
  type = "hAxis";
  options = { format: TYPE_NUMERIC, color: 'black' };

  // calculate data range required for good drawing
  // extend the horizontal data to full steps
  extendDataBox(box) {
    if (boxIsValid(box)) {
      var s;
      if (this.options.format === TYPE_DATE) {
        s = _calcDateSteps(box.left, box.right);
      } else {
        s = _calcSteps(box.left, box.right);
      }
      box.left = s.low;
      box.right = s.high;
      this.step = s.step;
    }
    return (box);
  };

  fDraw(box) {
    super.fDraw(box);

    if (boxIsValid(box)) {
      var step = this.step;
      var prec = (step < 1) ? String(step).length - 2 : 0;
      var scale = REGION_WIDTH / (box.right - box.left);
      var f = this.options.format;
      if (f === TYPE_NUMERIC) { f = 'num:' + prec }

      for (var n = box.left; n <= box.right; n += step) {
        var txt = formatValue(this.options.format, n).split(',');
        createSVGNode(this.parentObj, 'text', {
          x: (n - box.left) * scale,
          y: 0,
          style: 'fill:' + this.options.color,
        }, txt[0]);
        if (txt[1]) {
          createSVGNode(this.parentObj, 'text', {
            x: (n - box.left) * scale,
            y: 3,
            style: 'fill:' + this.options.color,
          }, txt[1]);
        }

      }
    } // if
  }; // fDraw()

  clear() {
    super.clear();
    _removeChilds(this.parentObj);
  }
}; // class HAxis


// Vertical Axis Class to create the labels for the horizontal axis. 
class VAxis extends GraphBase {
  type = "vAxis";
  options = { format: TYPE_NUMERIC, color: 'black' };

  extendDataBox(box) {
    var s = _calcSteps(box.minY, box.maxY);
    box.minY = s.low;
    box.maxY = s.high;
    this.step = s.step;
    return (box);
  }; // fBox()

  fDraw(box) {
    super.fDraw(box);

    var high = box.maxY;
    var low = box.minY;
    var step = this.step;
    var prec = (step < 1) ? String(step).length - 2 : 0;

    var scaleY = REGION_HEIGHT / (high - low);

    for (var n = low; n <= high; n += step) {
      createSVGNode(this.parentObj, 'text', {
        x: 11, y: -1 * (n - low) * scaleY
      }, String(Number(n).toFixed(prec)));
    }
  }; // fDraw()

  clear() {
    super.clear();
    _removeChilds(this.parentObj);
  }

}; // class VAxis


// Vertical Axis Class to create the labels for the horizontal axis. 
class HLine extends GraphBase {
  type = "HLine";
  options = { color: 'red' };

  extendDataBox(box) {
    if (box) {
      box.minY = Math.min(this.options.data, box.minY);
      box.maxY = Math.max(this.options.data, box.maxY);
    }
    return (box);
  }; // fBox()

  fDraw(box) {
    super.fDraw(box);

    var scaleY = REGION_HEIGHT / (box.maxY - box.minY);
    var y = (this.options.data - box.minY) * scaleY;

    this.drawObj = createSVGNode(this.parentObj, 'line', {
      class: 'hline',
      style: 'stroke:' + this.options.color,
      x1: 0, y1: y,
      x2: 128, y2: y
    });
  }; // fDraw()

  clear() {
    super.clear();
    if (this.drawObj) this.drawObj.remove();
    this.drawObj = undefined;
  }
}; // hLine

// Horizontal Axis Class to create the labels for the horizontal axis. 
class LineGraph extends GraphBase {
  type = "line";
  options = { linetype: 'line', color: 'black' };
  hasData = true;
  data;

  /**
   * Calculate outer box of an array of points.
   * @param {Point[]} points 
   */
  #calcDataBox(points) {
    /** @type Box */
    var box = null;

    if (points) {
      var xValues = points.map(function(p) { return p.x; });
      var yValues = points.map(function(p) { return p.y; });
      box = {
        left: Math.min(...xValues),
        right: Math.max(...xValues),
        minY: Math.min(...yValues),
        maxY: Math.max(...yValues)
      };
    }
    return (box);
  }; // _calcBox()


  clear() {
    super.clear();
    if (this.drawObj) this.drawObj.remove();
    this.drawObj = undefined;
  }

  setData(data) {
    super.setData(data);
    this.data = data;
  } // setData()


  // calculate data range required for good drawing of the data of this graph
  // extend the given box (may start with BOX_UNDEFINED)
  extendDataBox(box) {
    return (outerBox(box, this.#calcDataBox(this.data)));
  };


  fDraw(box) {
    super.fDraw(box);

    var vals = this.data;
    if (vals) {
      var scaleX = REGION_WIDTH / (box.right - box.left);
      var scaleY = REGION_HEIGHT / (box.maxY - box.minY);
      var points = [];

      if (this.options.linetype == 'steps') {
        points = vals.map((p) => 'H' + (p.x - box.left) * scaleX + ' V' + (p.y - box.minY) * scaleY);
        // starting point
        points[0] = "M" + (vals[0].x - box.left) * scaleX + ',' + (vals[0].y - box.minY) * scaleY;

      } else if (this.options.linetype == 'line') {
        points = vals.map((p, n) => (n > 0 ? 'L' : 'M') + (p.x - box.left) * scaleX + ',' + (p.y - box.minY) * scaleY);

      } else if (this.options.linetype == 'bezier') {
        var p = vals.map(p => { return ({ x: (p.x - box.left) * scaleX, y: (p.y - box.minY) * scaleY }) });
        const vl = vals.length;

        var cpLen = ((box.right - box.left) / vl / 2) * scaleX;

        // opposite lines as deltas with length cpLen
        var ol = [];

        // opposite Line at start point [is 0/0
        ol.push({ dx: 0, dy: 0 });
        for (let n = 1; n < vl - 1; n++) {
          // calculate the opposite line, dx, dy
          var dx = (p[n + 1].x - p[n - 1].x);
          var dy = (p[n + 1].y - p[n - 1].y);
          var l = Math.sqrt(dx * dx + dy * dy);
          ol.push({ dx: cpLen * dx / l, dy: cpLen * dy / l });
        }
        // opposite Line at end point is 0/0
        ol.push({ dx: 0, dy: 0 });

        points.push('M' + p[0].x + ',' + p[0].y);
        for (let n = 0; n < vl - 1; n++) {
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
      if (this.options.marker)
        attr['style'] += ';marker:url(#circle)';
      this.drawObj = createSVGNode(this.parentObj, 'path', attr);
    }

  }; // fDraw()

};


class Indicator extends GraphBase {
  type = 'indicator';
  options = { xFormat: TYPE_NUMERIC, yFormat: TYPE_NUMERIC };
  #dataGraph;

  #mouseOut = () => { this.drawObj.style.display = 'none'; };
  #mouseMove = (evt) => { this.#showValuePopUp(evt); };

  constructor(panelObj, indicator, dataGraph) {
    super(panelObj);
    this.drawObj = indicator;
    this.#dataGraph = dataGraph;
    panelObj.addEventListener('mouseout', this.#mouseOut);
    panelObj.addEventListener('mousemove', this.#mouseMove);
  };


  /** Hide the value indicator and unregister mouse move events */
  clear() {
    super.clear();
    this.drawObj.style.display = 'none';
    this.parentObj.removeEventListener('mouseout', this.#mouseOut);
    this.parentObj.removeEventListener('mousemove', this.#mouseMove);
  }

  /**
   * Calculate the event position using document units from mouse position.
   * @param {*} evt 
   */
  #eventPoint(evt) {
    var svg = this.parentObj.parentElement;

    var pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }; // eventPoint


  #showValuePopUp(evt) {
    var p = this.#eventPoint(evt);
    const data = this.#dataGraph.data;

    if (data && data.length) {
      var box = this.#dataGraph.box;
      var xData = box.left + ((p.x - 12) * (box.right - box.left)) / REGION_WIDTH;

      // find nearest data by x
      var n = data.findIndex(function(e) {
        return e.x > xData;
      });

      if (n < 0) {
        n = data.length - 1;
      } else if (n > 0 && data[n].x - xData > xData - data[n - 1].x) {
        // check for the n-1 value maybe closer
        n = n - 1;
      }

      const value = data[n];
      this.drawObj.style.display = '';

      var oLine = this.drawObj.querySelector('line');
      var oCircle = this.drawObj.querySelector('circle');
      var oInfo = this.drawObj.querySelector('.info');

      var xPos = ((value.x - box.left) * REGION_WIDTH) / (box.right - box.left);
      var yPos = (value.y - box.minY) * (REGION_HEIGHT / (box.maxY - box.minY));

      oLine.x1.baseVal.value = oLine.x2.baseVal.value = xPos;
      oCircle.cx.baseVal.value = xPos;
      oCircle.cy.baseVal.value = yPos;

      // calc infobox position
      xPos += xPos < REGION_WIDTH / 2 ? 2 : -20;
      yPos += yPos < REGION_HEIGHT / 2 ? 1 : -11;
      oInfo.setAttribute('transform', 'translate(' + xPos + ',' + yPos + ')');

      // add textual information
      var txtObjs = oInfo.querySelectorAll('text');
      txtObjs[0].textContent = formatValue(this.options.yFormat, value.y);
      var xTxt = formatValue(this.options.xFormat, value.x).split(',');
      txtObjs[1].textContent = xTxt[0];
      txtObjs[2].textContent = xTxt[1];
    } // if

  };

};


/** ULineChart is a web component class for displaying a line chart. */
export default class ULineChart extends UComponent {

  panelObj = this.shadowRoot.getElementById("panel");

  #DEFAULTOPTIONS = {
    fontSize: '6px',
    strokeWidth: 0.2,
  };

  #options = Object.assign({}, this.#DEFAULTOPTIONS);

  graphs = [];
  indicator = null;

  // remove all data and data bound graphs. 
  clear() {
    this.graphs.forEach(g => g.clear());

    this.graphs = [];
    if (this.indicator) {
      this.indicator.clear();
      this.indicator = null;
    }
  } // clear()


  /** Add a graph to the chart
   * @param {string} type 
   * @param {Object} options 
   */
  add(type = '', options = {}) {
    let graph;

    if (Array.isArray(type)) {
      type.forEach((t) => this.add(t.type, t.options));
      return
    }

    type = String(type).toLowerCase();
    if (type === 'line') {
      graph = new LineGraph(this.shadowRoot.getElementById('panel'));
      graph.setOptions(options);

    } else if (type == 'hline') {
      graph = new HLine(this.shadowRoot.getElementById('panel'));
      graph.setOptions(options);

    } else if (type == 'vaxis') {
      graph = new VAxis(this.shadowRoot.getElementById('v-labels'));
      graph.setOptions(options);

    } else if (type == 'haxis') {
      graph = new HAxis(this.shadowRoot.getElementById('h-labels'));
      graph.setOptions(options);

    } else if (type == 'indicator') {
      this.indicator = new Indicator(
        this.shadowRoot.getElementById('panel'),
        this.shadowRoot.querySelector('#ind'),
        this.graphs[0]);

    } else {
      console.error('ULine', `unknown graph type '${type}'`);

    }
    if (graph) {
      this.graphs.push(graph);
      this.graphs.sort((a, b) => GraphBase.compare(a, b));
    }
  }; // add


  /**
   * Set chart options.
   * @param {any} opts Options to control the look of the chart.
   */
  setOptions(opts) {
    this.style.setProperty('--fontSize', this.#options.fontSize);
    this.style.setProperty('--strokeWidth', this.#options.strokeWidth);
  } // setOptions()


  /// Draw the gauge chart based on the value.
  /// @param current value to be displayed.
  draw(values) {

    // find data graph and pass the values to it.
    var dataGraph = this.graphs.find(g => g.hasData);
    if (dataGraph) {
      dataGraph.setData(values);
    }

    // combine all data-boxes to a new box covering all data and paddings.
    var bx = this.graphs.reduce(function(box, graph) {
      return (graph.extendDataBox(box));
    }, BOX_UNDEFINED);

    this.graphs.forEach((g) => {
      g.fDraw(bx);
    });

  }; // draw()
} // ULineChart
</script>

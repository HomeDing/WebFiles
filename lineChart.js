// lineChart.js
/// <reference path="microsvg.js" />

var panelObj = document.getElementById("panel");
var backObj = document.getElementById("background");
var vObj = document.getElementById("v-labels");
var indObj = document.getElementById("ind");

var redrawTimer = null;

var REGION_WIDTH = 128;
var REGION_HEIGHT = 36;

function maxReducer(acc, val) {
  return Math.max(acc, val);
}

// point = [x,y], x may be date as seconds
/* 
interface Point {
  x: integer;
  y: integer;
}

interface Box {
  minX: number, maxX: number,
  minY: number, maxY: number;
}

interface GraphsData {
  type: "line", "vAxis", "hLine"
  data: Point[];
  box: Box;
  redraw: boolean; // needs a redraw
  svgObj: SVGElement;
  fDraw: function(g){}
}
 */

var graphs = [];

var minBox = { minX: Infinity, maxX: -Infinity, minY: 0, maxY: 1 };
var dataBox = minBox;
var displayBox = minBox;

// look in all graphs.data for maximum values

/** combine to boxes to a new box covering both. */
function outerBox(box1, box2) {
  return {
    minX: Math.min(box1.minX, box2.minX),
    maxX: Math.max(box1.maxX, box2.maxX),
    minY: Math.min(box1.minY, box2.minY),
    maxY: Math.max(box1.maxY, box2.maxY)
  };
} // outerBox()

/** combine to boxes to a new box covering both. */
function calcOuterBox(box, graph) {
  return outerBox(box, graph.box);
} // outerBox()

/** calculate the box of a graph  */
function calcGraphBox(graph) {
  if (!graph.data) {
    graph.box = Object.assign({}, minBox);
  } else {
    var xValues = graph.data.map(function(p) {
      return p.x;
    });
    var yValues = graph.data.map(function(p) {
      return p.y;
    });

    graph.box = {
      minX: Math.min.apply(null, xValues),
      maxX: Math.max.apply(null, xValues),
      minY: Math.min(0, Math.min.apply(null, yValues)),
      maxY: Math.max(1, Math.max.apply(null, yValues))
    };
  }
} // calcGraphBox

// Line Charts

function addLineChart(values) {
  var lineID = graphs.length;
  var g = (graphs[lineID] = { data: values, redraw: true, fDraw: drawLineChart });
  calcGraphBox(g);
  setRedraw();
  return lineID;
} // addLine()

function drawLineChart(g) {
  if (g.svgObj) {
    g.svgObj.remove();
  }

  var values = g.data;
  if (values) {
    var scaleX = 128 / (displayBox.maxX - displayBox.minX);
    var scaleY = 36 / (displayBox.maxY - displayBox.minY);

    var points = values.map(function(p) {
      return [(p.x - displayBox.minX) * scaleX, (p.y - displayBox.minY) * scaleY].join(',');
    });

    g.svgObj = createSVGNode(panelObj, 'polyline', {
      // id: 'line-' + lineID,
      class: 'linechart',
      points: points.join(' ')
    });
  }
}

// add a new data to the data of a line
function addLineChartData(lineID, values) {
  var g = graphs[lineID];
  g.data.push(values);
  g.redraw = true;
  calcGraphBox(g);
  setRedraw();
  return lineID;
} // addLineChartData()

// Update the values for a line and defer redrawing
function updateLineChartData(lineID, values) {
  var g = graphs[lineID];
  g.data = values;
  g.redraw = true;
  setRedraw();
  calcGraphBox(g);
} // updateLineChartData

function setMinScale(bBox) {
  Object.assign(minBox, bBox);
  setRedraw();
}

// ===== HLine horizontal lines =====

function addHLine(y) {
  var lineID = graphs.length;
  var g = (graphs[lineID] = { data: y, redraw: true, fDraw: drawHLine });
  g.box = Object.assign({}, minBox);
  setRedraw();
  return lineID;
}

function drawHLine(g) {
  if (g.svgObj) {
    g.svgObj.remove();
  }

  var scaleY = 36 / (displayBox.maxY - displayBox.minY);
  var y = (g.data - displayBox.minY) * scaleY;

  g.svgObj = createSVGNode(panelObj, 'line', {
    x1: 0,
    y1: y,
    x2: 128,
    y2: y,
    class: 'hline'
  });
}

// ===== Vertical Axis =====

function _calcVAxisBox(g) {
  var dataRange = dataBox.maxY - dataBox.minY;
  var dispRange = Math.pow(10, Math.floor(Math.log10(dataRange)));

  var step;
  if (dataRange <= dispRange * 2) {
    step = dispRange / 2;
  } else if (dataRange <= dispRange * 4) {
    step = dispRange;
  } else if (dataRange <= dispRange * 5) {
    step = dispRange;
  } else {
    step = 2 * dispRange;
  }
  g.box = displayBox;

  if (g.step !== step || dataBox.maxY > displayBox.maxY || dataBox.minY < displayBox.minY) {
    var high = Math.ceil(dataBox.maxY / step) * step;
    var low = Math.floor(dataBox.minY / step) * step;
    g.step = step;
    g.box = displayBox = Object.assign({}, dataBox, { minY: low, maxY: high });
  } // if
}

function addVAxis() {
  var lineID = graphs.length;
  var g = (graphs[lineID] = { data: [], redraw: true, fDraw: drawVAxis });
  _calcVAxisBox(g);
  setRedraw();
  return lineID;
}

function drawVAxis(g) {
  // clear existing y-Axis
  var YAxisGroup = document.getElementById('v-labels');
  Array.from(YAxisGroup.childNodes).forEach(function(c) {
    c.remove();
  });

  _calcVAxisBox(g);
  var high = displayBox.maxY;
  var low = displayBox.minY;

  console.log('y:', high, low);
  var scaleY = 36 / (high - low);

  var n;
  for (n = low; n <= high; n += g.step) {
    var txtObj = createSVGNode(vObj, 'text', {
      x: 11,
      y: -1 * (n - low) * scaleY
    });
    txtObj.textContent = String(n);
    // <text x="11" y="0">0-</text>
  }
}

// ===== Redraw =====

/** redraw lines when required. */
function redraw() {
  // find out if dataBox has changed
  var newBox = graphs.reduce(calcOuterBox, minBox);
  var doAll =
    newBox.minY != dataBox.minY || newBox.maxY != dataBox.maxY || newBox.minX != dataBox.minX || newBox.maxX != dataBox.maxX;
  dataBox = newBox;
  displayBox = outerBox(displayBox, dataBox);

  if (doAll) {
    graphs.forEach(function(g) {
      g.fDraw(g);
      g.redraw = false;
    });
  } else {
    graphs.forEach(function(g) {
      if (g.redraw) {
        g.fDraw(g);
        g.redraw = false;
      }
    });
  } // if
  redrawTimer = null;
} // redraw()

function setRedraw() {
  if (!redrawTimer) redrawTimer = window.setTimeout(redraw, 20);
}

// =====

// addVAxis();

// var pmValues =
//   '1552763424,162*1552763444,66*1552763464,84*1552763485,84*1552763504,17*1552763524,1*1552763544,4*1552763565,22*1552763585,34*1552763604,58*1552763624,62*1552763644,55*1552763664,67*1552763685,75*1552763705,79*1552763724,101*1552763745,112*1552763765,96*1552763784,79*1552763804,80*1552763825,80*1552763844,80*1552763864,90*1552763885,81*1552763904,123*1552763924,99*1552763944,119*1552763964,169*1552763984,103*1552764004,86*1552764025,82*1552764045,80*1552764065,79*1552764085,79*1552764105,79*1552764125,79*1552764145,79*1552764165,80*1552764185,79*1552764205,79*1552764225,79*1552764245,78*1552764265,79*1552764285,79*1552764305,79*1552764325,79*1552764345,78*1552764365,79*1552764385,79*1552764405,79*1552764425,79';
// var pmArray = pmValues.split('*');

// var l1 = addLineChart(
//   pmArray.map(function(v) {
//     var p = v.split(',');
//     return { x: p[0], y: p[1] };
//   })
// );

// var l1 = addLineChart([
//   { x: Date.parse('2019-03-16T12:30:00'), y: 16 },
//   { x: Date.parse('2019-03-16T12:31:00'), y: 16 },
//   { x: Date.parse('2019-03-16T12:32:00'), y: 19 },
//   { x: Date.parse('2019-03-16T12:33:00'), y: 27 },
//   { x: Date.parse('2019-03-16T12:34:00'), y: 12 },
//   { x: Date.parse('2019-03-16T12:35:00'), y: 5 }
// ]);

// ===== Indicator =====

// === to:microsvg.js
/// calculate a event position using the document units.
function eventPoint(evt) {
  var svg = document.documentElement;
  var pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
} // eventPoint

function setIndicator(box, data) {
  if (box && data) {
    indObj.style.display = "";

    var indLine = indObj.querySelector("line");
    var indcircle = indObj.querySelector("circle");

    var xPos = ((data.x - box.minX) * REGION_WIDTH) / (box.maxX - box.minX);
    var yPos = ((data.y - box.minY) * REGION_HEIGHT) / (box.maxY - box.minY);

    indLine.x1.baseVal.value = indLine.x2.baseVal.value = xPos;
    indcircle.cx.baseVal.value = xPos;
    indcircle.cy.baseVal.value = yPos;

    var infoObj = indObj.querySelector(".info");
    // calc infobox position
    xPos += xPos < REGION_WIDTH / 2 ? 2 : -18;
    yPos += yPos < REGION_HEIGHT / 2 ? 2 : -12;
    infoObj.setAttribute("transform", "translate(" + xPos + "," + yPos + ")");
    var txtObjs = infoObj.querySelectorAll("text");
    txtObjs[0].textContent = data.y;
    txtObjs[1].textContent = new Date(data.x*1000).toISOString().replace(/([0-9\-]*)T([0-9\:]*).000Z/, '$2');

  } // if
} // setIndicator()

function clearIndicator() {
  indObj.style.display = "none";
}

panelObj.addEventListener("mouseout", clearIndicator);
panelObj.addEventListener("mousemove", function(evt) {
  var p = eventPoint(evt);

  var g = graphs[1];
  var box = g.box;
  var data = g.data;
  var xData = box.minX + ((p.x - 12) * (box.maxX - box.minX)) / REGION_WIDTH;

  // find nearest data by x
  var n = data.findIndex(function(e) {
    return e.x > xData;
  });
  // check for the n-1 value maybe nearer
  if (n > 0 && data[n].x - xData > xData - data[n - 1].x) {
    n = n - 1;
  }
  setIndicator(displayBox, data[n]);
});

document['api'] = {
  addLineChart: addLineChart,
  addLineChartData: addLineChartData,
  updateLineChartData: updateLineChartData,

  addHLine: addHLine,
  addVAxis: addVAxis,
  setMinScale: setMinScale
};

// End.

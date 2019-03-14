var panelObj = document.getElementById('panel');
var vObj = document.getElementById('v-labels');

/// <reference path="microsvg.js" />

function maxReducer(acc, val) {
  return Math.max(acc, val);
}

// point = [x,y], x may be date as seconds

var linesData = [];
var linesMeta = []; // {maxX:12, minX:0 }
var linesDraw = []; // true/false needs redraw

var minBox = { minX: Infinity, maxX: -Infinity, minY: 0, maxY: 1 };
var dataBox = minBox;
var displayBox = minBox;

// look in all linesData for maximum values

function outerBox(b1, b2) {
  var box = {
    minX: Math.min(b1.minX, b2.minX),
    maxX: Math.max(b1.maxX, b2.maxX),
    minY: Math.min(b1.minY, b2.minY),
    maxY: Math.max(b1.maxY, b2.maxY)
  };
  return box;
}

function scaleLine(lineID) {
  var xValues = linesData[lineID].map(function(p) {
    return p[0];
  });
  var yValues = linesData[lineID].map(function(p) {
    return p[1];
  });

  var meta = {
    minX: Math.min.apply(null, xValues),
    maxX: Math.max.apply(null, xValues),
    minY: Math.min(0, Math.min.apply(null, yValues)),
    maxY: Math.max(1, Math.max.apply(null, yValues))
  };
  linesMeta[lineID] = meta;
} // scaleLine

function drawLine(lineID) {
  var lObj = document.querySelector('#line-' + lineID);
  if (lObj) {
    lObj.parentElement.removeChild(lObj);
  }

  var values = linesData[lineID];
  var meta = displayBox; // linesMeta[lineID];

  var scaleX = 128 / (meta.maxX - meta.minX);
  var scaleY = 36 / (meta.maxY - meta.minY);

  var offX = meta.minX;
  var offY = meta.minY;

  var points = values.map(function(p) {
    return [(p[0] - offX) * scaleX, (p[1] - offY) * scaleY].join(',');
  });

  // <polyline points="0,0 10,20 20,5 40,40"
  // marker-end="url(#arrow)" marker-start="url(#circle)" marker-mid="url(#circle)" />

  createSVGNode(panelObj, 'polyline', {
    id: 'line-' + lineID,
    points: points.join(' ')
  });
}

function drawY() {
  // clear existing y-Axis
  var YAxisGroup = document.getElementById('v-labels');
  Array.from(YAxisGroup.childNodes).forEach(function(c) {
    c.remove();
  });

  var dataRange = dataBox.maxY - dataBox.minY;
  var dispRange = Math.pow(10, Math.floor(Math.log10(dataRange)));

  var step;
  if (dataRange < dispRange * 2) {
    step = dispRange / 2;
  } else if (dataRange < dispRange * 4) {
    step = dispRange;
  } else if (dataRange < dispRange * 5) {
    step = dispRange;
  } else if (dataRange < dispRange * 10) {
    step = 2 * dispRange;
  }

  var high = Math.ceil(dataBox.maxY / step) * step;
  var low = Math.floor(dataBox.minY / step) * step;
  displayBox = Object.assign({}, dataBox, { minY: low, maxY: high });

  console.log('y:', high, low);
  var scaleY = 36 / (high - low);

  var n;
  for (n = low; n <= high; n += step) {
    var txtObj = createSVGNode(vObj, 'text', {
      x: 11,
      y: -1 * (n - low) * scaleY
    });
    txtObj.textContent = String(n);
    // <text x="11" y="0">0-</text>
  }
}

function redraw(lineID) {
  if (scaleLine(lineID)) {
    // draw all lines
    linesData.forEach(function(d, n) {
      drawLine(n);
    });
  } else {
    // draw single line
    drawLine(lineID);
  }
} // redraw()

function addValues(lineID, values) {
  if (typeof values == 'number') values = [values];
  if (typeof values == 'string') values = [Number(values)];
  linesData[lineID].push(values);
  redraw(lineID);
  return lineID;
}

function addLine(values) {
  var lineID = linesData.length;
  linesData[lineID] = values;
  linesDraw[lineID] = true;

  scaleLine(lineID);
  var newBox = linesMeta.reduce(outerBox, minBox);
  var doAll =
    newBox.minY != dataBox.minY ||
    newBox.maxY != dataBox.maxY ||
    newBox.minX != dataBox.minX ||
    newBox.maxX != dataBox.maxX;

  if (doAll) {
    linesDraw.forEach(function(v, n) {
      linesDraw[n] = true;
    });
  } // if

  dataBox = newBox;

  return lineID;
} // addLine()

function drawLines() {
  for (var n in linesData) {
    if (linesDraw[n]) drawLine(n);
    linesDraw[n] = false;
  }
} // draw

// function updateLine(lineID, values) {
//   linesData[lineID] = values;

//   redraw(lineID);
//   return lineID;
// }

// var l1 = addLine([1,5,3,6,4,8,9,12]);

function setMinScale(bBox) {
  Object.assign(minBox, bBox);
}

// debugger;
// setMinScale({maxY:50});


var l1 = addLine([
  [Date.parse('2019-03-12T16:30:00'), 16],
  [Date.parse('2019-03-12T16:31:00'), 16],
  [Date.parse('2019-03-12T16:32:00'), 19],
  [Date.parse('2019-03-12T16:33:00'), 27],
  [Date.parse('2019-03-12T16:34:00'), 12],
  [Date.parse('2019-03-12T16:35:00'), -12]
]);

var l2 = addLine([[Date.parse('2019-03-12T16:30:00'), 0], [Date.parse('2019-03-12T16:35:00'), 0]]);

drawY();
drawLines();

// addValues(l1, [12]);
// addValues(l1, 14);

// addLine([8, 8]);

document['api'] = {
  addLine: addLine,
  addValues: addValues,
  drawLines: drawLines
};

// End.

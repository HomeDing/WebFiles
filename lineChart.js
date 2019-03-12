var panelObj = document.getElementById('panel');

/// <reference path="microsvg.js" />

function maxReducer(acc, val) {
  return Math.max(acc, val);
}

// point = [x,y], x may be date as seconds

var linesData = [];
var linesMeta = []; // {maxX:12, minX:0 }
var gScale= {minX: 0,maxX: 1,minY: 0,maxY: 1};

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
  var meta = gScale; // linesMeta[lineID];

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
  linesData.push(values);
  scaleLine(lineID);
  var newScale = linesMeta.reduce(outerBox);
  var doAll = ((newScale.minY != gScale.minY) || (newScale.maxY != gScale.maxY));
  gScale = newScale;
  if (doAll) {
    // draw all lines
    linesData.forEach(function(d, n) {
      drawLine(n);
    });
  } else {
    // draw single line
    drawLine(lineID);
  }
    return lineID;
}

function updateLine(lineID, values) {
  linesData[lineID] = values;
  redraw(lineID);
  return lineID;
}

// var l1 = addLine([1,5,3,6,4,8,9,12]);

var l1 = addLine([
  [Date.parse('2019-03-12T16:30:00'), 16],
  [Date.parse('2019-03-12T16:31:00'), 16],
  [Date.parse('2019-03-12T16:32:00'), 19],
  [Date.parse('2019-03-12T16:33:00'), 17],
  [Date.parse('2019-03-12T16:34:00'), 22],
  [Date.parse('2019-03-12T16:35:00'), 21]
]);

var l2 = addLine([
  [Date.parse('2019-03-12T16:30:00'), 10],
  [Date.parse('2019-03-12T16:35:00'), 10]
]);

// addValues(l1, [12]);
// addValues(l1, 14);

// addLine([8, 8]);

document['api'] = {
  addLine: addLine,
  addValues: addValues,
  updateLine: updateLine
};

// End.

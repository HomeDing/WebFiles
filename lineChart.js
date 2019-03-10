var panelObj = document.getElementById('panel');

/// <reference path="microsvg.js" />

function maxReducer(acc, val) {
  return Math.max(acc, val);
}

var linesData = [];
var linesMax = [];
var allMax = 1; // overall Maximum in values

// look in all linesData for maximum values

function scaleLine(lineID) {
  linesMax[lineID] = Math.max.apply(null, linesData[lineID]);
  var gMaxY = Math.max.apply(null, linesMax);
  if (gMaxY == 0) {
    allMax = 1;
    return true; // redraw all
  } else if (gMaxY != allMax) {
    allMax = gMaxY;
    return true; // redraw all
  }
  return false;
} // scaleLine

function drawLine(lineID) {
  var lObj = document.querySelector('#line-' + lineID);
  if (lObj) {
    lObj.parentElement.removeChild(lObj);
  }

  var values = linesData[lineID];
  var maxX = values.length - 1;

  var scaleX = 136 / maxX;
  var scaleY = 40 / allMax; // linesMax[lineID];

  var points = values.map(function(y, n) {
    return [n * scaleX, y * scaleY].join(',');
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
  redraw(lineID);
  return lineID;
}

function updateLine(lineID, values) {
  linesData[lineID] = values;
  redraw(lineID);
  return lineID;
}

var l1 = addLine([]);
// var l2 = addLine([10, 10]);

// addValues(l1, [12]);
// addValues(l1, 14);

// addLine([8, 8]);

document['api'] = {
  addLine: addLine,
  addValues: addValues,
  updateLine: updateLine
};

// End.

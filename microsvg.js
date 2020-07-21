/// svg implementation helpers

function createSVGNode(parentNode, tagName, properties) {
  var n = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  for (var p in properties) {
    n.setAttribute(p, properties[p]);
  }
  parentNode.appendChild(n);
  return (n);
} // createSVGNode()


/// calculate the event position using document units from mouse position.
function eventPoint(evt) {
  var svg = document.documentElement;
  var pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
} // eventPoint



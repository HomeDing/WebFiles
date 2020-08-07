/// svg implementation helpers

/**
 * Create a SVG element
 * @param {SVGAElement} parentNode 
 * @param {string} tagName 
 * @param {Object | undefined} properties 
 * @param {string | undefined} txt 
 */
function createSVGNode(parentNode, tagName, properties, txt) {
  var n = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  if (properties) {
    Object.getOwnPropertyNames(properties).forEach(function(p) {
      n.setAttribute(p, properties[p]);
    });
  }
  if (txt) { n.textContent = txt; }
  parentNode.appendChild(n);
  return (n);
} // createSVGNode()


/**
 * Calculate the event position using document units from mouse position.
 * @param {*} evt 
 */
function eventPoint(evt) {
  var svg = document.documentElement;
  var pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
} // eventPoint



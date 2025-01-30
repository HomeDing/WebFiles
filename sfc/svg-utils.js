/**
 * Create a SVG element
 * @param {SVGAElement} parentNode container node for the new element
 * @param {string} tagName tagName of the new element
 * @param {Object | undefined} attr attributes of the new element passed as Object 
 * @param {string | undefined} txt inner text content.   
 */
export function createSVGNode(parentNode, tagName, attr, txt) {
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

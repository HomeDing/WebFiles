// panel.js

// http://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/

// calc the current event/mouse/touch position
function getSVGPos(panel, evt) {
  var newScale = panel.currentScale;
  var translation = panel.currentTranslate;
  var panelPos = panel.getBoundingClientRect();
  var ret = {
    x: Math.round((evt.clientX - translation.x) / newScale - panelPos.left),
    y: Math.round((evt.clientY - translation.y) / newScale - panelPos.top)
  };
  return (ret);
} // getSVGPos()

// mode a svg group to a specific position using transform:translate
function moveSVGGroup(g, x, y) {
  g.setAttribute('transform', 'translate(' + x + ',' + y + ')');
} // moveSVGGroup
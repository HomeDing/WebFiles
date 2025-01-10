<!--
Implementation of a web component for displaying a pie chart based on data.

The component displays ...

<u-piechart></u-piechart>

## HTML Attributes

* **value** -- The initial value attribute can be given by a html tag attribute
* **nnn** -- The nnn attribute ...

## JavaScript accessible attributes

## JavaScript accessible methods

-->

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -24 48 48">
    <g id="panel"></g>
    <g id="values"></g>
  </svg>
</template>

<style scoped>
:host {
  display: inline-block;
  width: 300px;
  aspect-ratio: 1;
  --fontSize : 3px;
  --strokeWidth : .2;
}

svg {
  font-family: sans-serif;
}

.segment {
  stroke: #fff;
  stroke-width: var(--strokeWidth);
}

.text {
  stroke: 0;
  font-size: var(--fontSize);
  text-anchor: middle;
  dominant-baseline: middle;
}
</style>

<script>
export default class UPieChart extends UComponent {
  // constants
  RAD_OUT = 22;

  DEFAULTOPTIONS = {
    fontSize: '3px',
    strokeWidth: 0.2,
    showTitle: false,
    showValue: false,
    showPercentage: false,
    colors: []
  };

  data = [];
  options = {};

  /**
  * Calculate a point on the circle, usable for svg paths
  * @param {number} alpha degree of angle
  * @param {number} r radius of circle
  * @returns string with <x>,<y>.
  */
  _piePoint(alpha, r) {
    return (String(Math.sin(alpha) * r) + ',' + String(-Math.cos(alpha) * r));
  } // _piePoint()


  /**
   * Create a SVG element
   * @param {SVGAElement} parentNode container node for the new element
   * @param {string} tagName tagName of the new element
   * @param {Object | undefined} attr attributes of the new element passed as Object 
   * @param {string | undefined} txt inner text content.   
   */
  createSVGNode(parentNode, tagName, attr, txt) {
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


  _clearChildNodes(p) {
    Array.from(p.childNodes).forEach(function(c) {
      c.remove();
    });
  } // _clearChildNodes()


  /**
   * Append another pie slice inside inside the panelObj.
   * @param start start of slice in percent
   * @param size size of slice in percent
   * @param color color of slice
   * @param value value of slice to be shown
   * @param title description of slice to be shown
   */
  _addSlice(start, size, color, value, title) {
    var alpha = 2 * Math.PI * start;
    var beta = 2 * Math.PI * (start + size);
    var opts = this.options;

    // create pie slice path
    let p =
      "M" + this._piePoint(alpha, this.RAD_OUT)
      + "A" + this.RAD_OUT + "," + this.RAD_OUT;

    if (size < 0.5) {
      p += " 0 0 1 ";
    } else {
      p += " 0 1 1 ";
    }
    p += this._piePoint(beta, this.RAD_OUT);
    p += "L0,0Z";
    var pNode = this.createSVGNode(this.shadowRoot.querySelector('#panel'), "path", {
      class: "segment",
      style: "fill:" + color,
      d: p
    });

    if ((opts.showTitle) || (opts.showValue) || (opts.showPercentage)) {
      const tValues = [];

      if (opts.showTitle) { tValues.push(String(title)); }
      if (opts.showValue) { tValues.push(Number(value).toLocaleString()); }
      if (opts.showPercentage) { tValues.push('(' + Math.round(size * 100) + '%)'); }

      // calc lightness of fill color
      var lum = window.getComputedStyle(pNode)
        .fill  // returns e.g. rgb(0, 0, 139)
        .match(/\d+/g)
        .reduce(function(s, e) { return (s + Number(e)) }, 0) / 3;


      // create text element on top of pie slice
      var tPoint = this._piePoint((alpha + beta) / 2, this.RAD_OUT * 0.7).split(',');
      this.createSVGNode(this.shadowRoot.querySelector('#values'), "text", {
        class: "text",
        style: "fill:" + ((lum > 127) ? "black" : "white"),
        x: tPoint[0], y: tPoint[1]
      }, tValues.join(' '));
    } // if
  } // _addSlice()


  init() {
    super.init();
    this.options = this.DEFAULTOPTIONS;
  }


  /// Clear the pie chart. 
  /// Remove all visible elements.
  clear() {
    const dom = this.shadowRoot;
    this._clearChildNodes(dom.querySelector('#panel'));
    this._clearChildNodes(dom.querySelector('#values'));
  } // clear()


  /// Set chart options.
  /// @param opts: Options to control the look of the chart. 
  setOptions(opts) {
    this.options = Object.assign({}, this.DEFAULTOPTIONS, opts);
    if (opts.colors) {
      var cols = opts.colors;
      if (typeof cols == "string")
        this.options.colors = cols.split(',');
      else if (Array.isArray(cols))
        this.options.colors = [...cols];
    }
    // this.shadowRoot.style.setProperty('--fontSize', );
    this.style.setProperty('--fontSize', this.options.fontSize);
    this.style.setProperty('--strokeWidth', this.options.strokeWidth);
  } // setOptions()


  /// Draw the pie chart based on the data.
  /// @param data Array with data and colors for segments
  draw(data) {
    this.clear();

    var cl = this.options.colors;
    var cll = this.options.colors.length

    if (data) {
      // calculate sum of all parts:
      var sum = data.reduce(function(x, e) { return (x + e.value); }, 0);

      data.reduce(function(start, el, indx) {
        var p = el.value / sum;
        var col = el.color || cl[indx % cll] || "gray";

        this._addSlice(start, p, col, el.value, el.title);
        return (start + p);
      }.bind(this), 0);
    } // if
  } // draw()
}
</script>

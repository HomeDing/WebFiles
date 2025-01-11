<!--
Implementation of a web component for displaying a gauge chart
based on segment definitions and a value.

The component displays ...

<u-gaugechart></u-gaugechart>

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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -24 48 48">
    <g id="panel" transform="translate(0, 10)"></g>
    <g id="needle" transform="translate(0, 10) rotate(0)">
      <rect width="12" height="1" x="-23" y="-0.5" />
    </g>

    <g id="values">
      <text id="title" x="0" y="-18"></text>
      <text id="minimum" x="-16" y="13"></text>
      <text id="maximum" x="16" y="14"></text>
      <text id="value" x="0" y="12"></text>
      <text id="units" x="0" y="18"></text>
    </g>
  </svg>
</template>

<style scoped>
:host {
  display: inline-block;
  width: 300px;
  aspect-ratio: 1;
  --fontSize: 3px;
  --strokeWidth: .2;
}

svg {
  font-family: sans-serif;
}

.segment {
  stroke: #fff;
  stroke-width: var(--strokeWidth);
}

text {
  fill: black;
  stroke: 0;
  font-size: 3px;
  text-anchor: middle;
  dominant-baseline: middle;

  &#value {
    font-size: var(--fontSize);
  }
}

#needle rect {
  fill: #0000A0;
}

#needle {
  transition: transform 0.5s;
}
</style>

<script>
export default class UGaugeChart extends UComponent {
  // constants
  #RAD_OUT = 22;
  #RAD_IN = 12;

  panelObj = this.shadowRoot.getElementById("panel");
  valuesObj = this.shadowRoot.getElementById("values");

  #DEFAULTOPTIONS = {
    fontSize: '6px',
    strokeWidth: 0.2,
    title: 't',
    minimum: 'mi',
    maximum: 'ma',
    units: 'ut',
    segments: [
      {
        color: '#4040ff'
      }
    ]
  };

  #options = this.#DEFAULTOPTIONS;

  /**
  * Calculate a point on the circle, usable for svg paths
  * @param {number} alpha degree of angle
  * @param {number} r radius of circle
  * @returns string with <x>,<y>.
  */
  #cPoint(alpha, r) {
    return (String(Math.sin(alpha) * r) + ',' + String(-Math.cos(alpha) * r));
  } // #cPoint()


  /**
   * Create a SVG element
   * @param {SVGAElement} parentNode container node for the new element
   * @param {string} tagName tagName of the new element
   * @param {Object | undefined} attr attributes of the new element passed as Object 
   * @param {string | undefined} txt inner text content.   
   */
  #createSVGNode(parentNode, tagName, attr, txt) {
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


  #clearChildNodes(p) {
    Array.from(p.childNodes).forEach(function(c) {
      c.remove();
    });
  } // #clearChildNodes()


  _drawSegment(start, end, color) {
    var alpha = Math.PI * (start - 0.5);
    var beta = Math.PI * (end - 0.5);
    var p = "";

    p += "M" + this.#cPoint(alpha, this.#RAD_OUT);
    p += "A" + this.#RAD_OUT + "," + this.#RAD_OUT;
    p += " 0 0 1 ";
    p += this.#cPoint(beta, this.#RAD_OUT);

    p += "L" + this.#cPoint(beta, this.#RAD_IN);
    p += "A" + this.#RAD_IN + "," + this.#RAD_IN;
    p += " 0 0 0 ";
    p += this.#cPoint(alpha, this.#RAD_IN);
    p += "Z";

    var pNode = this.#createSVGNode(this.panelObj, "path", {
      class: "segment",
      style: "fill: " + color,
      d: p
    });
  }


  // init() {
  //   super.init();
  // }

  /// Clear the gauge chart. 
  /// Remove all visible elements.
  clear() {
    this.draw();
  } // clear()


  /// Set chart options.
  /// @param opts: Options to control the look of the chart. 
  setOptions(opts) {
    this.#options = Object.assign({}, this.#options, opts);

    // set text
    this.shadowRoot.querySelector('#title').textContent = this.#options.title;
    this.shadowRoot.querySelector('#minimum').textContent = this.#options.minimum;
    this.shadowRoot.querySelector('#maximum').textContent = this.#options.maximum;
    this.shadowRoot.querySelector('#units').textContent = this.#options.units;

    // draw segments
    this.#clearChildNodes(this.panelObj);
    var r = (this.#options.maximum - this.#options.minimum);
    var v = this.#options.minimum;
    this.#options.segments.forEach(seg => {
      var h = seg.value || this.#options.maximum;
      this._drawSegment(
        (v - this.#options.minimum) / r,
        (h - this.#options.minimum) / r,
        seg.color);
      v = h;
    });

    this.style.setProperty('--fontSize', this.#options.fontSize);
    this.style.setProperty('--strokeWidth', this.#options.strokeWidth);
  } // setOptions()


  /// Draw the gauge chart based on the value.
  /// @param current value to be displayed.
  draw(value = NaN) {
    var v = Number(value);
    var r = -20;

    if ((value == null) || isNaN(value)) {
      value = '';

    } else if (v < this.#options.minimum) {
      r = -20;

    } else if (v > this.#options.maximum) {
      r = 200;

    } else {
      // calc rotation
      r = 180 * (v - this.#options.minimum) / (this.#options.maximum - this.#options.minimum);
    }
    // set text
    this.shadowRoot.getElementById("value").textContent = value;

    // set needle
    var rotate = this.shadowRoot.querySelector('svg').createSVGTransform();
    rotate.setRotate(r, 0, 0);
    this.shadowRoot.querySelector("#needle").transform.baseVal.replaceItem(rotate, 1);
  } // draw()
}
</script>

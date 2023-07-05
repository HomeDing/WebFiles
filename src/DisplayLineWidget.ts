// DisplayLineWidget.ts: Widget Behavior implementation for DisplayLine Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />
/// <reference path="DisplayItemWidget.ts" />

@MicroControl('displayline')
class DisplayLineWidgetClass extends DisplayItemWidgetClass {
  _svgElem!: SVGElement;

  /**
 * Create a SVG element
 * @param {SVGAElement} parentNode container node for the new element
 * @param {string} tagName tagName of the new element
 * @param {Object | undefined} attr attributes of the new element passed as Object 
 * @param {string | undefined} txt inner text content.   
 */
  createSVGNode(parentNode: Element, tagName: string, attr?: any, txt?: string) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", tagName);
    if (attr) {
      Object.getOwnPropertyNames(attr).forEach(function(p) {
        n.setAttribute(p, attr[p]);
      });
    }
    if (txt) { n.textContent = txt; }
    parentNode.appendChild(n);
    return (n);
  } // createSVGNode()


  override connectedCallback() {
    super.connectedCallback();
    if (this._dispElem) {
      //   this._elem = createHTMLElement(this._dispElem, 'span', { class: 'line' });
      this._svgElem = this._dispElem.querySelector('svg') as SVGElement;
      this._elem = this.createSVGNode(this._svgElem, 'line', { strokeWidth: 1 }) as any as HTMLElement;
    }
  } // connectedCallback

  override newData(path: string, key: string, value: string) {
    const e: SVGLineElement = this._elem as any as SVGLineElement;

    if (key === 'x') {
      e.x1.baseVal.value = Number(value);
    } else if (key === 'y') {
      e.y1.baseVal.value = Number(value);
    }
    else if (key === 'x1') { e.x2.baseVal.value = Number(value); }
    else if (key === 'y1') { e.y2.baseVal.value = Number(value); }
    else if (key === 'color') {
      e.style.stroke = value;
    }
    else {
      super.newData(path, key, value);
    }
  } // newData

} // class DisplayLineWidgetClass

// End.

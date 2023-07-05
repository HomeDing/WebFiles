// DisplayLineWidget.ts: Widget Behavior implementation for DisplayLine Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />
/// <reference path="DisplayItemWidget.ts" />

@MicroControl('displaybutton')
class DisplayButtonWidgetClass extends DisplayItemWidgetClass {
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
      // this._svgElem = this._dispElem.querySelector('svg') as SVGElement;
      // this._elem = this.createSVGNode(this._svgElem, 'line', { strokeWidth: 1 }) as any as HTMLElement;
      this._elem = createHTMLElement(this._dispElem, 'button', { class: 'but', style: 'top:0;left:0' });
    }
  } // connectedCallback

  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    const e = this._elem;
    const sty = this._elem.style;
    if (key === 'text') {
      e.innerText = value;
    } else if (key === 'w') {
      sty.width = value + (this._grid > 1 ? 'ch' : 'px');
    } else if (key === 'h') {
      sty.height = value + (this._grid > 1 ? 'em' : 'px');
      sty.fontSize = (Number(value)*0.7) + (this._grid > 1 ? 'em' : 'px');
    } else if (key === 'color') {
      sty.borderColor = value.replace(/^x/, '#');
    }
  } // newData

} // class DisplayLineWidgetClass

// End.

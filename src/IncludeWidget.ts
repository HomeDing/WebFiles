// IncludeWidget.ts: Widget to include html objects from the templates on page load.

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

// include a placeholder <div u-is="include" u-ref="{CSS-selector here}"></div> into the loaded document
// so search for a template using the u-ref parameter containing a selector.
// The template will replace the placeholder.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('include')
class IncludeWidgetClass extends MicroControlClass {
  query: string | null = null;

  // constructor() {}

  connectedCallback() {
    this.query = this.getAttribute('ref');

    const obj = document.querySelector('#u-templates ' + this.query);
    console.log('included.', this.query, obj);

    if (obj) {
      const e = obj.cloneNode(true) as HTMLElement;
      const root = this.parentElement;
      // root?.insertBefore(e, this);
      root?.replaceChild(e, this);
    }
  } // connectedCallback

}
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
  ref!: string | null;

  override connectedCallback() {
    const obj = document.querySelector('#u-templates ' + this.ref);

    if (obj) {
      const e = obj.cloneNode(true) as HTMLElement;
      const root = this.parentElement;
      root?.replaceChild(e, this);
    }
  } // connectedCallback

}

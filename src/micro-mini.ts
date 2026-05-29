// file: micro.ts
// micro implementation for web controls using html templates and behaviors.

//   setTextContent, findConfig, changeConfig } from "./utils"; ???

import { micro } from "./microRegistry";

export { fetchJSON, fetchText, createHTMLElement, debounce, getHashParams, setAttr, toBool } from "./utils";
export { hub } from "./microHub";
export { micro } from "./microRegistry";

export { jsonParse } from './JsonParse.js';

// import { JsonParseCallback, jsonParse, jsonFind, jsonLocate } from "./JsonParse";

// import { MicroControlClass, MicroControl} from "./microControls";
// import { MicroRegistry, micro } from "./microRegistry";
// micro;

console.log('micro.ts loaded');

// detect that a new micro control was created using Mutation Observe Callback
const obs = new MutationObserver(function(mutationsList: MutationRecord[], _observer) {
  for (const mutation of mutationsList) {
    mutation.addedNodes.forEach(n => {
      const e = <Element>n;
      if (e.getAttribute && e.getAttribute('u-is')) {
        micro.attach(<HTMLElement>n);
      }
    });
  }
});
obs.observe(document, { childList: true, subtree: true });

document.addEventListener('DOMContentLoaded', function() {
  function f() { document.querySelectorAll('[data-src]:not([src])').forEach(e => micro.loadDataImage(e as HTMLElement)); }
  window.addEventListener('scroll', f);
  window.setTimeout(f, 40);
});

// core set of Widgets
import { BL0937WidgetClass } from "./BL0937Widget";
import { ButtonWidgetClass } from "./ButtonWidget";
import { ColorWidgetClass } from "./ColorWidget";
import { InputWidgetClass } from "./InputWidget";
import { PWMOutWidgetClass } from "./PWMoutWidget";
import { ValueWidgetClass } from "./ValueWidget";
import { SceneWidgetClass } from "./SceneWidget";
import { SelectWidgetClass } from "./SelectWidget";
import { TimerWidgetClass } from "./TimerWidget";

BL0937WidgetClass;
ButtonWidgetClass;
ColorWidgetClass;
InputWidgetClass;
PWMOutWidgetClass;
ValueWidgetClass;
SceneWidgetClass;
SelectWidgetClass;
TimerWidgetClass;

// extends to the full set of Widgets
// import { DisplayItemWidgetClass } from "./DisplayItemWidget";
// import { DisplayButtonWidgetClass } from "./DisplayButtonWidget";
// import { DisplayDotWidgetClass } from "./DisplayDotWidget";
// import { DisplayLineWidgetClass } from "./DisplayLineWidget";
// import { DisplayTextWidgetClass } from "./DisplayTextWidget";
// import { DisplayWidgetClass } from "./DisplayWidget";
// import { DSTimeWidgetClass } from "./DSTimeWidget";
// import { LogWidgetClass } from "./LogWidget";

// DisplayButtonWidgetClass;
// DisplayDotWidgetClass;
// DisplayItemWidgetClass;
// DisplayLineWidgetClass;
// DisplayTextWidgetClass;
// DisplayWidgetClass;
// DSTimeWidgetClass;
// LogWidgetClass;

// End.

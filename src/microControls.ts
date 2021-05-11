// microControls.ts: a micro components implementation almost like web components.

// mixins for HTMLElements
// templates foc cloning new controls.

/// <reference path="micro.ts" />

// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
// https://www.typescriptlang.org/docs/handbook/decorators.html

interface MicroControlClass extends HTMLElement {
  _attachedBehavior: MicroControlClass | undefined;
  connectedCallback(): void;
  init?(): void;
  term?(): void;
} // ControlInterface

class MicroControlClass {
  connectedCallback(): void {}
}

// Decorator for micro-controls.
// Extend all DOM elements with the behavior specified by the target class.
function MicroControl(isSelector: string) {
  // this is the decorator factory
  return function(target: any) {
    // this is the decorator class
    micro.define(isSelector, new target() as GenericWidgetClass);
    return target;
  };
}

// End.

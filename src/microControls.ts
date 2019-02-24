// microControls.ts: a micro components implementation almost like web components.

// mixins for HTMLElements
// templates foc cloning new controls.

/// <reference path="micro.ts" />

// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
// https://www.typescriptlang.org/docs/handbook/decorators.html

interface ControlInterface {
  el: HTMLElement;
  connectedCallback(el: HTMLElement): void;
}

// Decorator for micro-controls.
// Extend all DOM elements with the behavior specified by the target class.
function MicroControl(isSelector: string) {
  // this is the decorator factory
  return function(target) {
    // this is the decorator class
    console.info(`MicroControl ${target.name} registered for ${isSelector}`); // only usable in chrome.
    micro.define(isSelector, new target());
    return target;
  };
}

// @MicroControl("no-base")
class MicroBaseControl implements ControlInterface {
  el: HTMLElement;
  constructor() {}
  connectedCallback(el: HTMLElement): void {
    this.el = el;
  }
} // class MicroBaseControl

// End.

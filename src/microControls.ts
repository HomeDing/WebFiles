// MicroControls.ts

export interface MicroControlClass extends HTMLElement {
  _attachedBehavior: MicroControlClass | undefined;
  connectedCallback(): void;
  init?(): void;
  term?(): void;
} // ControlInterface

// ===== @MicroControl('...') decorator and mixin base class for micro controls =====

export class MicroControlClass  {
  _attachedBehavior: MicroControlClass | undefined = undefined as any;

  connectedCallback(): void {
    // empty
  }

  /// <summary>remove all textnodes from the control to avoid unwanted spaces.</summary>
  _clearWhitespace() {
    let obj = <Node>this.firstChild;
    while (obj) {
      const nextObj = <Node>obj.nextSibling;
      if (obj.nodeType === 3) {
        obj.parentNode?.removeChild(obj);
      }
      obj = nextObj;
    } // while
  } // _clearWhitespace
}

// End.

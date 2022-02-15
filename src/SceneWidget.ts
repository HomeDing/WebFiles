// ButtonWidget.ts: Widget Behavior implementation for Button Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('scene')
class SceneWidgetClass extends GenericWidgetClass {
  static _sceneCard?: HTMLElement;
  _buttonObj!: HTMLButtonElement;

  connectedCallback() {
    super.connectedCallback();
    if (!SceneWidgetClass._sceneCard) {
      // used first scene as container for all buttons
      SceneWidgetClass._sceneCard = this;
    } else {
      this.style.display = 'none';
    }
    const c = SceneWidgetClass._sceneCard.querySelector('div.block:last-child') as HTMLDivElement;
    this._buttonObj = createHTMLElement(c, 'button', {
      'microid': this.microid
    }) as HTMLButtonElement;
    this._buttonObj.textContent = '-';
  }

  on_click(evt: MouseEvent) {
    console.log(evt.target);
    const btnObj = evt.target as HTMLButtonElement;
    let action = btnObj.getAttribute('microid');
    if (action) {
      if (action.startsWith('/')) action = action.substring(1);
      this.dispatchAction(action + '?start=1', '1');
    }
  }

  startScene() { 0 }

  newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key && value) {
      if (key === 'title') {
        this._buttonObj.textContent = value;
      }
    } // if
  } // newData()
}

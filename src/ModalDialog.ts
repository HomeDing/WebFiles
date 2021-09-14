// ModalDialog.ts: Behavior implementation for modal dialogs.

// Dialogs can be opened using ModalDialogClass.open()
// Open Dialogs can be replaced by using the ModalDialogClass.next()
// Open Dialogs can be replaced by using the ModalDialogClass.next()
// ModalDialogClass.openFocus() creates a dialog with an existing element.

// The static function will take care of creating a modal frame
// so the dialog implementatoin can focus on the functional elements.

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('modal')
class ModalDialogClass extends MicroControlClass {
  static _stack: ModalDialogClass[] = [];

  protected _isOpen = false;
  protected _backObj: HTMLElement | undefined;
  protected _frameObj: HTMLElement | undefined;
  protected _focusObj: HTMLElement | undefined;
  protected _placeObj: HTMLElement | undefined;
  protected params: any = {};
  protected _keyHandler: any;

  _handleEsc(e: KeyboardEvent) {
    if ((e.key === 'Escape') && (ModalDialogClass._stack[ModalDialogClass._stack.length - 1] === this)) {
      this.close();
    }
  }

  /**
   * Static helper to open a new dialog on top of existing ones.
   * @param tmplName Name of template
   * @param data optional data to pass
   */
  static open(tmplName: string, data: any) {
    const m = micro.insertTemplate(document.body, 'modal', data) as ModalDialogClass;
    m.open(tmplName, data);
  }


  /**
   * Static helper to open a new dialog on top of existing ones.
   * @param tmplName Name of template
   * @param data optional data to pass
   */
  static openFocus(obj: HTMLElement) {
    const m = micro.insertTemplate(document.body, 'modal', {}) as ModalDialogClass;
    m.openFocus(obj);
  }


  /**
   * Static helper to close the top current dialog and open the next one.
   * @param tmplName Name of template
   * @param data optional data to pass
   */
  static next(tmplName: string, data: any) {
    const m = this._stack[this._stack.length - 1];
    m.next(tmplName, data);
  }


  /**
   * Static helper to save result of a dialog to parent dialog before closing.
   * @param data data to pass
   */
  static save(data: any) {
    const m = this._stack[this._stack.length - 2];
    const dlg = m._frameObj?.firstElementChild;
    if ((<any>dlg).save) { (<any>dlg).save(data); }
  }


  /**
   * Static helper to close the top dialog.
   */
  static close() {
    const m = this._stack[this._stack.length - 1];
    m.close();
  }


  connectedCallback() {
    super.connectedCallback();
    this._backObj = this.querySelector('.modalBack') as HTMLElement;
    this._frameObj = this.querySelector('.modalFrame') as HTMLElement;
  }

  /**
   * Open a new dialog on top of existing ones.
   * @param tmplName Name of template
   * @param data optional data to pass
   */
  open(tmplName: string, data: any) {
    ModalDialogClass._stack.push(this);

    if ((this._backObj) && (this._frameObj)) {
      this._keyHandler = this._handleEsc.bind(this)
      document.addEventListener('keydown', this._keyHandler);
      const dlg = micro.insertTemplate(this._frameObj, tmplName, data);
      const fObj = dlg?.querySelector('input,button,select') as HTMLElement;
      fObj?.focus();
    }
  }

  /**
   * Open a new dialog insead of the existing one.
   * @param tmplName Name of template
   * @param data optional data to pass
   */
  next(tmplName: string, data: any) {
    if ((this._backObj) && (this._frameObj)) {
      this._frameObj.firstElementChild?.remove();
      const dlg = micro.insertTemplate(this._frameObj, tmplName, data);
      const fObj = dlg?.querySelector('input,button,select') as HTMLElement;
      fObj?.focus();
    }
  } // next

  // open modal viewer with existing object
  openFocus(obj: HTMLElement) {
    ModalDialogClass._stack.push(this);

    if ((obj) && (obj.parentElement) && this._frameObj) {
      this._keyHandler = this._handleEsc.bind(this)
      document.addEventListener('keydown', this._keyHandler);

      this._focusObj = obj;
      // this._focusStyle = obj.getAttribute('style');

      // create placeholder for obj with same size
      const r = obj.getBoundingClientRect();
      this._placeObj = createHTMLElement(obj.parentElement, 'div', {
        style: 'width:' + r.width + 'px;height:' + r.height + 'px',
        class: obj.className
      }, obj);

      let f = 4;
      f = Math.min(f, (window.innerWidth - 64) / r.width);
      f = Math.min(f, (window.innerHeight - 64) / r.height);

      // size the dialog
      const ph = createHTMLElement(this._frameObj, 'div', {
        style: 'width:' + f * r.width + 'px;height:' + f * r.height + 'px'
      });
      const pr = ph.getBoundingClientRect();

      // make obj free floating over dialog
      obj.classList.add('modal-object');
      obj.style.top = pr.top + 'px';
      obj.style.left = pr.left + 'px';
      obj.style.width = pr.width + 'px';
      obj.style.height = pr.height + 'px';
    } // if
  } // openFocus


  on_click(evt: PointerEvent) {
    const tar = evt.target as HTMLElement;
    const ua = tar.getAttribute('u-action');
    if (ua === 'close') {
      this.close();
    }
  }


  // close this dialog and remove all elements.
  close() {
    document.removeEventListener('keydown', this._keyHandler);
    if (this._focusObj) {
      const o = this._focusObj;
      o.classList.remove('modal-object');
      o.style.top = '';
      o.style.left = '';
      o.style.width = '';
      o.style.height = '';
      this._placeObj?.remove();
    }
    ModalDialogClass._stack.pop();
    this.remove();
  }
} // ModalDialogClass

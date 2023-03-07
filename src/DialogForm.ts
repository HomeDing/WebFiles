// DialogFormClass.ts: Behavior implementation for native dialogs with forms.
// This file is part of the Widget implementation for the HomeDing Library.

// Dialogs are implemented as HTML <dialog> elements containing a <from> element.
// Dialogs can be opened using DialogFormClass.openModalForm(id, data)

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

type DialogCallback = ((data: any) => void);

@MicroControl('dialogform')
class DialogFormClass extends MicroControlClass {

  private _defaultData = {};
  private _data = {};
  private _form?: FormJsonData;
  private _callback?: DialogCallback = undefined;

  /**
   * Static helper to open a new dialog on top of existing ones.
   * @param tmplName Name of template
   * @param data optional data to pass
   */
  static openModalForm(id: string, data: any = {}, cb?: DialogCallback) {
    const dlg = document.querySelector('dialog#' + id);
    if (dlg)
      (<DialogFormClass>dlg).openModalForm(data, cb);
  } // open

  override connectedCallback() {
    super.connectedCallback();

    const f = this.querySelector('form');
    if (f) {
      this._form = (f as FormJsonData);
      this._defaultData = this._form.getJsonData();
    }
  }


  // setup the form and dialog with open-event and data propagation
  // into u-text placeholders and form elements 
  openModalForm(data: any = {}, cb?: DialogCallback) {
    this._data = Object.assign({}, this._defaultData, data);
    (<any>this).returnValue = '';
    this._callback = cb;

    // dispatch open event to extend dialog implementation
    // can dynamically add elements to the form
    this.dispatchEvent(new CustomEvent("open", {
      detail: {
        dialog: this,
        data: this._data,
        form: this._form
      },
      bubbles: true,
      cancelable: true,
      composed: false,
    }));

    // populate placeholders (not form elements) with current data 
    this.querySelectorAll('*[u-text]').forEach((e) => {
      const key = (<HTMLSpanElement>e).getAttribute('u-text');
      if (key) { e.textContent = data[key]; }
    });

    if (this._form) {
      (this._form as FormJsonData).setJsonData(data);
      // // populate form with current data
      // const fields = this._form.querySelectorAll('*[name]');
      // fields.forEach((f) => {
      //   // populate values from data
      //   if ((f.tagName == 'INPUT') || (f.tagName == 'SELECT')) {
      //     const val = data[(<HTMLInputElement>f).name];
      //     if (val) {
      //       (<HTMLInputElement>f).value = val;
      //     }
      //   }
      // });
    }
    // open Dialog in modal mode
    (<any>this).showModal();
  } // openModalForm()


  on_click(evt: PointerEvent) {
    const tar = evt.target as HTMLElement;

    const ua = tar.getAttribute('u-action');
    if (ua === 'close') {
      (<any>this).returnValue = 'cancel';
      (<any>this).close();
    }
  }


  on_submit(evt: SubmitEvent) {
    const uSub = evt.submitter;

    if (uSub && this._form) {
      // get JSON data from form
      const ret = this._form.getJsonData();

      const ua = uSub.getAttribute('u-action');
      if (ua?.startsWith('next:')) {
        (<any>this).returnValue = 'ok';
        const nextID = ua.substring(5); // without 'next:'
        DialogFormClass.openModalForm(nextID, ret);

      } else if (ua === 'return') {
        // these buttons are used return dialog data by callback
        if (this._callback) {
          this._callback(ret);
        }

      } else if (ua === 'done') {
        // these buttons are used to implement dialog specific submits
        (<any>this).returnValue = 'ok';

      } else {
        evt.preventDefault();
      }
    }
  }

  on_cancel(_evt: any) {
    (<any>this).returnValue = 'cancel';
  }

} // DialogFormClass

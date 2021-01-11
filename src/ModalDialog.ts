// ModalDialog.ts

class ModalDialogClass {

  // modal handling
  protected _isOpen = false;
  protected _focusObj: HTMLElement | undefined;
  protected _placeholderObj: HTMLElement | undefined;
  protected _focusStyle: string | null = null;
  protected _mObj: HTMLElement | null = null;
  protected _cObj: HTMLElement | null = null;


  constructor() {
    const scope = this;
    window.addEventListener('load', function () {
      scope._mObj = document.getElementById('modal');
      scope._cObj = document.getElementById('container');
    });
  } // constructor()


  // open modal viewer with template
  isOpen(): boolean {
    return (this._isOpen);
  }

  // open modal viewer with template
  open(tmplName: string, data: any) {
    if ((this._mObj) && (this._cObj)) {
      // open Dialog, replace existing.
      this._cObj.innerHTML = '';
      this._cObj.style.width = '';
      this._cObj.style.height = '';
      micro.insertTemplate(this._cObj, tmplName, data);
      this._mObj.classList.remove('hidden');
      this._isOpen = true;
      // console.log (containerObj);
    } // if
  } // open()


  // open modal viewer with existing object
  openFocus(obj: HTMLElement) {
    let p: HTMLElement;

    if (!this._isOpen && (obj) && (obj.parentElement) && (this._mObj) && (this._cObj)) {
      this._focusObj = obj;
      this._focusStyle = obj.getAttribute('style');

      const r = obj.getBoundingClientRect();

      // create placeholder for obj with same size
      p = obj.cloneNode(false) as HTMLElement;
      p.style.width = r.width + 'px';
      p.style.height = r.height + 'px';
      obj.parentElement.insertBefore(p, obj);
      this._placeholderObj = p;

      // make obj free floating over dialog
      obj.classList.add('modal-object');
      obj.style.top = r.top + 'px';
      obj.style.left = r.left + 'px';
      obj.style.width = r.width + 'px';
      obj.style.height = r.height + 'px';

      // open Dialog, replace existing.
      this._cObj.innerHTML = '';
      this._cObj.style.width = '';
      this._cObj.style.height = '';

      // calculate max. size factor possible
      let f = 2;
      f = Math.min(f, (window.innerWidth - 64) / r.width);
      f = Math.min(f, (window.innerWidth - 64) / r.height);

      const w = Math.floor(r.width * f) + 'px';
      const h = Math.floor(r.height * f) + 'px';

      // add a dummy div element with target size
      p = document.createElement('div');
      p.style.width = w;
      p.style.height = h;
      this._cObj.appendChild(p);
      const r2 = p.getBoundingClientRect();

      this._mObj.classList.remove('hidden');
      // move focus object right there.
      obj.style.margin = '0';
      obj.style.top = r2.top + 'px';
      obj.style.left = r2.left + 'px';
      obj.style.width = w;
      obj.style.height = h;
      this._isOpen = true;
    } // if
  } // openFocus


  close() {
    if ((this._mObj) && (this._cObj)) {
      this._mObj.classList.add('hidden');
      if (this._focusObj && this._placeholderObj && this._placeholderObj.parentElement) {
        // restore styling of focusObj
        this._focusObj.setAttribute('style', this._focusStyle || '');
        this._focusObj.classList.remove('modal-object');
        this._placeholderObj.parentElement.removeChild(this._placeholderObj);
      } // if
      this._cObj.innerHTML = '';
      this._isOpen = false;
    } // if
  } // close()

} // ModalDialogClass

// one global modal object.
const modal = new ModalDialogClass();

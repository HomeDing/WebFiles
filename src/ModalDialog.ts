// ModalDialog.ts

class ModalDialogClass {

  // modal handling
  protected _isOpen: boolean = false;
  protected _focusObj: HTMLElement | undefined;
  protected _placeholderObj: HTMLElement | undefined;
  protected _focusStyle: string | null = null;


  // open modal viewer with template
  isOpen(): boolean {
    return (this._isOpen);
  }

  // open modal viewer with template
  open(tmplName: string, data: any) {
    const modalObj = document.getElementById('modal');
    const containerObj = document.getElementById('modalContainer');

    if ((modalObj) && (containerObj)) {
      // open Dialog, replace existing.
      containerObj.innerHTML = '';
      containerObj.style.width = "";
      containerObj.style.height = "";
      micro.insertTemplate(containerObj, tmplName, data);
      modalObj.classList.remove('hidden');
      this._isOpen = true;
      // console.log (containerObj);
    } // if
  } // open()


  // open modal viewer with existing object
  openFocus(obj: HTMLElement) {
    const modalObj = document.getElementById('modal');
    const containerObj = document.getElementById('modalContainer');
    var p: HTMLElement;

    if ((obj) && (obj.parentElement) && (modalObj) && (containerObj)) {
      this._focusObj = obj;
      this._focusStyle = obj.getAttribute('style');

      const w = obj.clientWidth;
      const h = obj.clientHeight;

      const r = obj.getBoundingClientRect();

      // create placeholder for obj with same size
      p = obj.cloneNode(false) as HTMLElement;
      p.style.width = w + "px";
      p.style.height = h + "px";
      obj.parentElement.insertBefore(p, obj);
      this._placeholderObj = p;

      // make obj free floating over dialog
      obj.classList.add('modalObject');
      obj.style.top = r.top + 'px';
      obj.style.left = r.left + 'px';
      obj.style.width = r.width + 'px';
      obj.style.height = r.height + 'px';

      // open Dialog, replace existing.
      containerObj.innerHTML = '';
      containerObj.style.width = '';
      containerObj.style.height = '';

      // add a dummy div element with target size
      p = document.createElement('div');
      p.setAttribute('style', "background-color:pink");
      p.style.width = (r.width * 2) + 'px';
      p.style.height = (r.height * 2) + 'px';
      containerObj.appendChild(p);

      modalObj.classList.remove('hidden');
      // move focus object right there.
      var r2 = p.getBoundingClientRect();
      obj.style.margin = '0';
      obj.style.top = r2.top + 'px';
      obj.style.left = r2.left + 'px';
      obj.style.width = (r.width * 2) + 'px';
      obj.style.height = (r.height * 2) + 'px';
      this._isOpen = true;
    } // if
  } // openFocus


  close() {
    const modalObj = document.getElementById('modal');
    const containerObj = document.getElementById('modalContainer');
    if ((modalObj) && (containerObj)) {
      modalObj.classList.add('hidden');
      containerObj.innerHTML = '';
      if (this._focusObj && this._placeholderObj && this._placeholderObj.parentElement) {
        this._focusObj.setAttribute('style', this._focusStyle || '');
        this._focusObj.classList.remove('modalObject');
        this._placeholderObj.parentElement.removeChild(this._placeholderObj);
      } // if
      this._isOpen = false;
    } // if
  } // close()


}

const modal = new ModalDialogClass();

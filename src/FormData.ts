// FormJsonData.js

type FormDataRecord = { [index: string]: any };

class FormJsonData extends HTMLFormElement {


  // private
  #analyzed = false;
  #emptyRecord: FormDataRecord = {};
  #booleanAttributes = new Set();

  renderedCallback() {
    console.log('forjson:', 'rendered');

  }
  // connectedCallback() {
  //   ... is called when the html element is ready, but form elements may not be there at this time.
  //   console.log('forjson:', 'connected');
  //   document.addEventListener('DOMContentLoaded', this.analyze.bind(this));
  // }

  // analyse all form element types that can be used as input to create an empty record
  // including all known form elements.
  analyze() {
    this.querySelectorAll<HTMLInputElement>('input[name]').forEach(e => this.#emptyRecord[e.name] = '');
    this.querySelectorAll<HTMLTextAreaElement>('textarea[name]').forEach(e => this.#emptyRecord[e.name] = '');
    this.querySelectorAll<HTMLSelectElement>('select[name]').forEach(e => this.#emptyRecord[e.name] = e.value || '');
    this.querySelectorAll<HTMLInputElement>('input[name][type=range]').forEach(e => this.#emptyRecord[e.name] = 0);
    this.querySelectorAll<HTMLInputElement>('input[name][type=color]').forEach(e => this.#emptyRecord[e.name] = '#000000');
    this.querySelectorAll<HTMLInputElement>('input[name][type=checkbox]').forEach(e => {
      this.#emptyRecord[e.name] = false;
      this.#booleanAttributes.add(e.name);
    });
    this.#analyzed = true;

    console.log('forjson:', 'emptyRecord:', this.#emptyRecord);
    // not: output, meter
  }

  // return the formData as Object including empty values.
  getJsonData() {
    if (!this.#analyzed) this.analyze();
    const formData = new FormData(this);
    let jData: FormDataRecord = Object.fromEntries(formData);
    jData = Object.assign({}, this.#emptyRecord, jData);
    Object.entries(jData).forEach(([name, value]) => {
      if (this.#booleanAttributes.has(name)) {
        jData[name] = Boolean(value === 'on');
      }
    });
    return (jData);
  } // getJsonData()


  // set the value of the form elements according the name including form output elements
  setJsonData(jData: FormDataRecord) {
    let hasChanged = false;
    if (!this.#analyzed) this.analyze();
    Object.entries(jData).forEach(([name, value]) => {
      this.querySelectorAll<HTMLInputElement>(`*[name=${name}]`).forEach(el => {
        if (el.type === 'radio') {
          if (el.checked !== (el.value === value)) {
            el.checked = (el.value === value);
            hasChanged = true;
          }
        } else if (el.type === 'checkbox') {
          if (el.checked !== (!!value)) {
            el.checked = (!!value);
            hasChanged = true;
          }
        } else if ((el.tagName === 'METER') || (el.tagName === 'OUTPUT')) {
          // output elements
          el.value = value;
        } else {
          if (el.value !== value) {
            el.value = value;
            hasChanged = true;
          }
        }
      });
    });

    if (hasChanged) {
      // create 'change' event on form element when form data was really changed.
      const evt = new Event('change');
      this.dispatchEvent(evt);
    }
  } // setJsonData()

} // class

customElements.define('form-json', FormJsonData, { extends: 'form' });
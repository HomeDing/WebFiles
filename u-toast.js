// micro toast notification implementation

class ToastMessageComponent extends HTMLElement {

  defaults = {
    design: "u-log",
    duration: 3000,
    close: false
  };

  _closeToast(box) {
    box.style.height = '';
    box.classList.add('u-fade');
  }

  // create a box for logs, alerts...
  _box(msg, options) {
    options = Object.assign({}, this.defaults, options);

    const box = document.createElement('div');
    box.className = 'u-box';

    const txt = document.createElement('div');
    txt.className = 'u-text';
    txt.classList.add(options.design);
    box.appendChild(txt);
    txt.innerText = msg;
    this.appendChild(box);

    // set height of box to the full value
    window.setTimeout(() => {
      box.style.height = box.clientHeight + 'px';
    }, 100);

    if (options.close) {
      // add close button to box
      const b = document.createElement('button');
      b.textContent = 'x';
      box.appendChild(b);
      b.addEventListener("click", () => {
        this._closeToast(box);
      }, box);
    }

    // close box after duration ....
    if (options.duration) {
      window.setTimeout(() => { this._closeToast(box); }, options.duration);
    }

    // finally remove box
    box.addEventListener("transitionend", () => { box.remove(); }, box);

  }

  // pre-configured toastr types.
  log(msg) {
    this._box(msg);
  }

  info(msg) {
    this._box(msg, { design: 'u-info' });
  }

  error(msg) {
    this._box(msg, { design: 'u-error', close: true, duration: 8000 });
  }
}

customElements.define('u-toast', ToastMessageComponent);

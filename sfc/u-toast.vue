<!--
Implementation of a web component for displaying toast messages ...

The component displays messages of type 'log', 'info', 'error'.

<u-toast></u-toast>

This element is typically added to the html body element and will position itself on the top right corner above any html.

## HTML Attributes

The style of the template web component can be changed using the <style> section in this file.

## JavaScript accessible methods

* setOptions(opts) -- Set chart options.
* draw(value) -- Adjust the needle and the displayed value.

## Options

The options are used to configure the chart and are passed using the setOptions function.

* **fontSize** -- The size of the value shown as text. Default is '6px'.
* **strokeWidth** -- The with of the stroke drawing a border around a segment. Default is 0.2.
* **title** -- : 't',
* **minimum** -- : 'mi',
* **maximum** -- : 'ma',
* **units** -- : 'ut',
* **segments** -- : [ { color: '#4040ff' }]

-->

<template>
</template>

<style scoped>
:host {
  --log-color: #111111;
  --info-color:#00bb11;
  --error-color: #bb0000;
  display: block;
  display: block;
  position: absolute;
  width: 320px;
  top: 1rem;
  right: 1rem;

  >div {
    position: relative;
    overflow-y: hidden;
    box-sizing: border-box;

    padding: 0.25em;
    margin-bottom: 0.25em;
    border-radius: 0.5em;
    color: black;
    background-color: white;
    border-left: 0.8em solid gray;

    &.fade {
      transition: all 0.5s linear;
      height: 0;
      padding-top: 0;
      padding-bottom: 0;
      margin-bottom: 0;
    }

    &.log {
      border-color: var(--log-color);
    }

    &.info {
      border-color: var(--info-color);
    }

    &.error {
      border-color: var(--error-color);
    }

    >button {
      position: absolute;
      right: 0.5em;
      top: 0;
      padding: 0.1em 0.2em;
      border: 0;
      min-width: 1em;
      color: white;
      background-color: var(--error-color);;
    }
  }

}
</style>

<script>
export default class UToast extends UComponent {
  // runtime options
  #options = {
    design: "u-log",
    duration: 3000,
    close: false
  };

  // ===== inner methods =====

  // create a box for logs, alerts...
  #addMessage(msg, options) {
    options = Object.assign({}, this.#options, options);

    const txt = document.createElement('div');
    txt.classList.add(options.design);
    txt.innerText = msg;
    this.shadowRoot.appendChild(txt);
    txt.style.height = txt.clientHeight + 'px';

    if (options.close) {
      // add close button to box
      const b = document.createElement('button');
      b.textContent = 'x';
      txt.appendChild(b);
      b.addEventListener("click", () => {
        txt.remove();
      });
    }

    if (options.duration) {
      // close box after duration ....
      window.setTimeout(() => {
        txt.style.height = '';
        txt.classList.add('fade');
      }, options.duration);

      // finally remove box
      txt.addEventListener("transitionend", () => {
        txt.remove();
      });

    }
  }

  /// ===== public methods =====

  // pre-configured toast-message types.
  log(msg, options = {}) {
    this.#addMessage(msg, Object.assign({ design: 'log' }, options));
  }

  info(msg, options = {}) {
    this.#addMessage(msg, Object.assign({ design: 'info' }, options));
  }

  error(msg, options = {}) {
    this.#addMessage(msg, Object.assign({ design: 'error', close: true, duration: 8000 }, options));
  }

}
</script>

<!--
Implementation of a web component for color picking with advanced integration functionality

The component will display the hex color value and show a circle with the color.
The color value and a standard change event is implemented to mimic the behavior of a standard HTML input[type=color] element. 

<my-colorpick value="#000088" cssvar="color"></my-colorpick>

## HTML Attributes

* **value** -- The initial value attribute can be given by a html tag attribute
* **cssvar** -- When a cssvar attribute is given the corresponding css variable on :root will be loaded on startup and changed.

When both value and cssvar are given the given value will overwrite the cssvar loading. 

## JavaScript accessible attributes

* **value** -- The value attribute can be read and changed by scripting.
-->


<template>
  <label>
    <input value="#FFFFFF" type="color">
    <div class="code">#FFEx00</div>
    <div class="pad"></div>
  </label>
</template>

<style scoped>
:host {
  display: inline-block;
  height:1lh;
  width:11ch;
  vertical-align: text-bottom ;
}

label {
  position: absolute;
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 0.2em;

  div {
    display: inline-block;
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
  }

  input {
    display: none;
  }

  .pad {
    border-radius: 100%;
    aspect-ratio: 1;
    border: 1px solid black;
  }
}
</style>

<script>
export default class ColorPick extends UComponent {
  static observedAttributes = ["value"];
  value = 'black';
  cssvar = '';

  // convert color values to hex using canvas context
  _hexColor(colorval) {
    var ctx = document.createElement('canvas').getContext('2d');
    ctx.strokeStyle = colorval;
    return(ctx.strokeStyle);
  }

  init() {
    // this.debug('init()');
    super.init();
    this.cssvar = this.getAttribute('cssvar');
    const oInput = this.shadowRoot.querySelector('input');

    // propagate color value change...
    oInput.addEventListener('change', (evt) => {
      const val = evt.target.value;

      // behave like an input element
      this.value = val;

      // support attributeChangedCallback
      this.setAttribute('value', val);

      // create a change event like on inputs 
      this.dispatchEvent(new Event("change"));
    });

    if (this.cssvar) {
      const col = getComputedStyle(document.documentElement).getPropertyValue('--' + this.cssvar);
      this.debug(`col=${col}`);
      oInput.setAttribute('value', col);
      this.setAttribute('value', col);
    }
  } // init()


  attributeChangedCallback(name, oldValue, newValue) {
    this.debug("attributeChanged", name, oldValue, newValue);
    this.cssvar = this.getAttribute('cssvar');

    if (name === 'value') {
      const dom = this.shadowRoot;
      const oCode = dom.querySelector('.code');
      const oPad = dom.querySelector('.pad');
      const oInput = dom.querySelector('input');

      if (!newValue) {
        oPad.style.backgroundColor = 'silver';
        oCode.textContent = '(none)';

      } else {
        // debugger;
        oPad.style.backgroundColor = newValue;
        newValue = this._hexColor(oPad.style.backgroundColor);
        this.debug(newValue);
        oInput.setAttribute('value', newValue);
        oCode.textContent = newValue;

        if (this.cssvar) {
          // a css variable should be changed.
          document.querySelector(":root").style.setProperty('--' + this.cssvar, newValue);
        }
      }
    }
  } // attributeChangedCallback()
}
</script>

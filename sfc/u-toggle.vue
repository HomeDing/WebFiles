<!--

Implementation of a web component that enriches the functionality of regular <time> elements
  to support locale specific formatting.

<time is='my-time' datestyle='' timestyle"='' datetime=''>

datetime

https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl

<dl>
  <dt><code>datetime</code></dt>
  <dd><p>...</p></dd>
</dl>


(description)

## HTML Attributes

## JavaScript accessible attributes

https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements

https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat


It may represent one of the following:

A time on a 24-hour clock.
A precise date in the Gregorian calendar (with optional time and timezone information).
A valid time duration.

customElements.define("my-time", ExpandingList, { extends: "time" });



const fmt = new Intl.DateTimeFormat(navigator.languages, {
  dateStyle: this._dateStyle,
  timeStyle: this._timeStyle,
});
this.textContent = fmt.format(date);


-->

<style></style>

<script extends="img">
export default class MyImgToggle extends HTMLImageElement {
  static observedAttributes = ["w12", "inpage", "alt"];

  _menuObj;

  connectedCallback() {
    console.debug('u-toggle', 'connected()');

    this.addEventListener('click', this.onClick.bind(this), false);

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', this.init.bind(this));
    } else {
      window.requestAnimationFrame(this.init.bind(this));
    }

  }
  init() {
    console.debug('u-toggle', 'init()');

    this._menuObj = document.querySelector('.menu');
    // debugger;
  } // init()


  // show the date and time as textContent in the defined style.
  showValue() {
  } // showValue()

  // show the date and time as textContent in the defined style.
  onClick() {
    console.debug('on-click');
    this._menuObj.classList.toggle('open');
    // debugger;
  } // showValue()


  attributeChangedCallback(name, oldValue, newValue) {
    console.debug("attributeChanged", name, oldValue, newValue);

  } // attributeChangedCallback()
}
</script>
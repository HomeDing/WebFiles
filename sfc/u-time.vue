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

<style>
    time[is="u-time"] {
      color: red;
    }
</style>

<script for="time">
  export default class MyTime extends HTMLTimeElement {
    static observedAttributes = ["datetime", "datestyle", "timestyle"];

    _value = '2020-01-01';
    _frm = undefined;
    _dateStyle = "medium";
    _timeStyle = "medium";


    init() {
      console.debug('init()');
      debugger;
    } // init()


    // show the date and time as textContent in the defined style.
    showValue() {
      let date;

      if (this._value === '') {
        date = new Date();

      } else if (this._value.match(/^\d+$/)) {
        date = new Date(Number(this._value));

      } else {
        date = new Date(this._value);
      }

      const fmt = new Intl.DateTimeFormat(navigator.languages, {
        dateStyle: this._dateStyle,
        timeStyle: this._timeStyle,
      });
      this.textContent = fmt.format(date);
    } // showValue()


    attributeChangedCallback(name, oldValue, newValue) {
      console.debug("attributeChanged", name, oldValue, newValue);

      this.value = this.getAttribute('datetime');
      this._frm = this.getAttribute('frm');

      if (name === 'datetime') {
        this._value = newValue;

      } else if (name === 'datestyle') {
        this._dateStyle = newValue.length ? newValue : undefined;
        if ((this._dateStyle === 'none') || (this._dateStyle === 'null')) {
          this._dateStyle = undefined;
        }

      } else if (name === 'timestyle') {
        this._timeStyle = newValue.length ? newValue : undefined;
        if ((this._timeStyle === 'none') || (this._timeStyle === 'null')) {
          this._timeStyle = undefined;
        }

      }
      this.showValue();
    } // attributeChangedCallback()
  }
</script>
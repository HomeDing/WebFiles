// ding.js: Behaviors for Elements

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />

// === Generic Widget Behavior ===

@MicroControl("generic")
class GenericWidgetClass extends MicroBaseControl {
  microid: string = "";
  data: Object = {};

  connectedCallback(el: HTMLElement) {
    super.connectedCallback(el);
    this.data = { id: this.microid };
    hub.subscribe(this.microid + "?*", this.newData.bind(this), true);
  } // connectedCallback

  // visualize any new data for the widget.
  newData(path: string, key: string, value: string) {
    // save data to title
    this.data[key] = value;
    var ic = this.el.querySelector("img");
    if (ic) {
      setAttribute2(
        ic,
        "title",
        JSON.stringify(this.data, null, 1)
          .replace("{\n", "")
          .replace("\n}", "")
      );
    }

    // u-activ flags
    ["span", "div"].forEach(function(elType) {
      this.el
        .querySelectorAll(elType + "[u-active='" + key + "']")
        .forEach(function(el: HTMLElement) {
          var b = toBool(value);
          setAttribute2(el, "value", b ? "1" : "0");
          setAttribute2(el, "title", b ? "active" : "not active");
          el.classList.toggle("active", b);
        });
    }, this);

    // textContent
    ["h2", "h4", "span"].forEach(function(elType) {
      this.el
        .querySelectorAll(elType + "[u-text='" + key + "']")
        .forEach(function(el) {
          if (el.textContent != value) el.textContent = value;
        });
    }, this);

    // value of input fields
    this.el
      .querySelectorAll("input[u-value='" + key + "']")
      .forEach(function(el: HTMLInputElement) {
        if (el.value != value) el.value = value;
      });
  } // newData()

  // send an action to the board and dispatch to the element
  dispatchAction(prop, val) {
    if (val != null) fetch(`/$board${this.microid}?${prop}=${encodeURI(val)}`);
  } // dispatchAction()

  // send changed value of property as an action to the board
  onchange(e) {
    var src = e.srcElement;
    this.dispatchAction(src.getAttribute("u-value"), e.srcElement.value);
  }

  // send an action to the board
  // + change config mode
  onclick(e: MouseEvent) {
    var src = e.srcElement;
    var a = src.getAttribute("u-action");
    if (a) this.dispatchAction(a, e.srcElement["value"]);

    if (src.classList.contains("setconfig")) {
      this.el.classList.toggle("configmode");
    }
  }
} // GenericWidgetClass

// End.

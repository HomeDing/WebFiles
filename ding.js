// ding.js: Behaviors for Elements

// === Generic Behavior ===

var GenericElementBehavior = {
  microid: "",
  data: {},

  init: function () {
    hub.subscribe(this.microid + "?*", this.newData.bind(this));
    this.newData(this.microid, "id", this.microid);
    this.data = {
      id: this.microid
    };
  }, // init

  newData: function (path, key, value) {
    // save data to title
    this.data[key] = value;
    var ic = this.querySelector("img");
    if (ic) {
      ic.title = JSON.stringify(this.data, null, 2);
    }

    // flags
    ['span'].forEach(function (elType) {
      this.querySelectorAll(elType + "[u-active='" + key + "']").forEach(function (el) {
        var b = toBool(value);
        el.setAttribute('value', (b ? 1 : 0));
        el.title = (b ? 'active' : 'not active');
        el.classList.toggle('active', b);
      });
    }, this);

    // textContent
    ['h2', 'h4', 'span'].forEach(function (elType) {
      this.querySelectorAll(elType + "[u-text='" + key + "']").forEach(function (el) {
        el.textContent = value;
      });
    }, this);

    // value
    this.querySelectorAll("input[u-value='" + key + "']").forEach(function (e) {
      e.value = value;
    });

  }, // newData()

  onchange: function (e) {
    var src = e.srcElement;
    dispatch(this.microid, src.getAttribute('u-value'), e.srcElement.value);
  },

  onclick: function (e) {
    var src = e.srcElement;
    var a = src.getAttribute('u-action');
    if (a)
      dispatch(this.microid, a, e.srcElement.value);
  }
}; // GenericElementBehavior

jcl.registerBehavior("generic", GenericElementBehavior);

// End.
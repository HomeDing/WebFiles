// ding.js: Behaviors for Elements

// === Generic Behavior ===

var GenericElementBehavior = {
  microID: "",
  data: {},

  init: function () {
    hub.subscribe(this.microid + "?*", this.newData.bind(this));
    this.newData(this.microid, "id", this.microid);
    this.data = {};
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
      this.querySelectorAll(elType + "[boolproperty='" + key + "']").forEach(function (el) {
        var b = toBool(value);
        el.setAttribute('value', (b ? 1 : 0));
        el.title = (b ? 'active' : 'not active');
        el.classList.toggle('active', b);
      });
    }, this);

    // textContent
    ['h2', 'h4', 'span'].forEach(function (elType) {
      this.querySelectorAll(elType + "[property='" + key + "']").forEach(function (el) {
        el.textContent = value;
        el.title = value;
      });
    }, this);

    this.querySelectorAll("input[property='" + key + "']").forEach(function (e) {
      e.value = value;
    });
  }, // newData()

  onchange: function (e) {
    var src = e.srcElement;
    dispatch(this.microid, src.getAttribute('property'), e.srcElement.value);
    // debugger;
  },

  onclick: function (e) {
    var src = e.srcElement;
    dispatch(this.microid, src.getAttribute('property'), e.srcElement.value);
  }
}; // GenericElementBehavior

jcl.registerBehaviour("generic", GenericElementBehavior);


// === Timer Behavior ===

var ButtonElementBehavior = {
  inheritFrom: GenericElementBehavior,

  onmousedown: function (e) {
    var src = e.srcElement;
    if (src.classList.contains('u-button')) {
      src.classList.add('active');
      dispatch(this.microid, 'value', 1);
    } // if
  },

  onmouseup: function (e) {
    var src = e.srcElement;
    if (src.classList.contains('u-button')) {
      src.classList.remove('active');
      dispatch(this.microid, 'value', 0);
    } // if
  }
}; // ButtonElementBehavior
jcl.registerBehaviour("button", ButtonElementBehavior);


// === Timer Behavior ===

var TimerElementBehavior = {
  inheritFrom: GenericElementBehavior,
  wt: 0,
  pt: 0,
  ct: 0,
  time: 0,

  _timeToSec: function (v) {
    v = v.toLowerCase();
    if (v.endsWith('h')) {
      v = parseInt(v, 10) * 60 * 60;
    } else if (v.endsWith('m')) {
      v = parseInt(v, 10) * 60;
    } else if (v.endsWith('s')) {
      v = parseInt(v, 10);
    } // if
    return (v);
  },

  newData: function (path, key, value) {
    // alert(key);
    if (key == "waittime") {
      this.wt = this._timeToSec(value);
    } else if (key == "pulsetime") {
      this.pt = this._timeToSec(value);
    } else if (key == "cycletime") {
      this.ct = this._timeToSec(value);
    } else if (key == "time") {
      this.time = this._timeToSec(value);
    }

    if (this.ct < 0 + this.wt + this.pt)
      this.ct = 0 + this.wt + this.pt

    // update bars
    if (this.ct > 0) {
      var el = this.querySelector(".u-bar");
      var f = el.clientWidth / this.ct;
      var pto = el.querySelector(".pulse");
      pto.style.left = Math.floor(this.wt * f) + "px";
      pto.style.width = Math.floor(this.pt * f) + "px";
      var cto = el.querySelector(".current");
      cto.style.width = Math.floor(this.time * f) + "px";
    }
  } // newData()
}; // TimerElementBehavior

jcl.registerBehaviour("timer", TimerElementBehavior);
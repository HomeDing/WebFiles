// SliderWidget.ts: Widget Behavior implementation for Slider Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl("slider")
class SliderWidgetClass extends GenericWidgetClass {
  _handle: HTMLElement | null = null; /// <summary>Reference to the handle obj.</summary>
  _lastValue: number = -1; /// <summary>last published value to avoid doublicate events.</summary>
  _maxright: number = 100; //= p.offsetWidth - this._handle.offsetWidth;
  _x: number = 0; // x - offset of mouse and handle while moving. 
  _xOffset: number = 0; // x - offset of mouse and area. 
  unit: number = 1;

  minvalue: number = 0; /// <summary>The value that is reached on the leftmost position of the knob.</summary>
  maxvalue: number = 255; /// <summary>The value that is reached on the rightmost position of the knob.</summary>

  _moveFunc: any;
  _upFunc: any;

  connectedCallback() {
    this._handle = this.querySelector(".handle");
    super.connectedCallback();
    // find the moveable knob
    if (this._handle) {
      const p = <HTMLElement>this._handle.parentElement;
      const ps = getComputedStyle(p);
      this._maxright = p.clientWidth - this._handle.offsetWidth - parseFloat(<string>ps.paddingLeft) - parseFloat(<string>ps.paddingRight);
    }
  } // connectedCallback

  // adjust position of the handle
  _adjustHandle(val: number) {
    if (this._handle) {
      let left = val - this.minvalue;

      left = Math.round(left * this._maxright / (this.maxvalue - this.minvalue));
      left = Math.min(this._maxright, Math.max(0, left));
      this._handle.style.left = left + "px";
    }
  } // _adjustHandle()


  newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key == 'value') {
      const v = Number(value);
      if (v != this._lastValue) {
        this._adjustHandle(v);
        this._lastValue = v;
      }
    } else if (key == 'min') {
      this.minvalue = Number(value);
    } else if (key == 'max') {
      this.maxvalue = Number(value);
    } else if (key == 'step') {
      this.unit = Number(value);
    } // if
  } // newData()


  on_click(e: MouseEvent) {
      var src: HTMLElement | null = e.srcElement as HTMLElement;
      while (src != null && src.classList.length == 0) src = src.parentElement;
      if (src != null) {

        if (src.classList.contains('up')) {
          // alert('plus');
          this.dispatchAction('up', '1');
        }
        else if (src.classList.contains('down')) {
          // alert('plus');
          this.dispatchAction('down', '1');
        } else {
          super.on_click(e);
        }
      }
      // if (src == o) this.dispatchAction('toggle', '1');
  }

  on_mousedown(evt: MouseEvent) {
    if (evt.target == this._handle) {
      this.MoveStart(evt);
    } // if
  } // onmousedown()

  MoveStart(evt: MouseEvent) {
    /// <summary>Start sliding the knob.</summary>
    this._xOffset = 0;
    var obj = (this._handle as HTMLElement).offsetParent as (HTMLElement | null);
    while (obj != null) {
      this._xOffset += obj.offsetLeft;
      obj = obj.offsetParent as HTMLElement;
    } // while

    // calculate mousepointer-knob delta
    this._x = evt.clientX - ((this._handle as HTMLElement).offsetLeft + this._xOffset);

    // attach move-handlers on document to get any move
    this._moveFunc = this._onmousemove.bind(this);
    document.addEventListener('mousemove', this._moveFunc, false);
    this._upFunc = this._onmouseup.bind(this);
    document.addEventListener('mouseup', this._upFunc, false);

    // cancel selecting anything
    evt.cancelBubble = true;
    evt.returnValue = false;
  } // MoveStart


  _onmousemove(evt: MouseEvent) {
    /// <summary>Handle the mouse button move event. This handler will be attached to the document level.</summary>
    var left = evt.clientX - this._x - this._xOffset;
    left = Math.min(this._maxright, Math.max(0, left));

    // calc value from position
    var val = Math.round(left * (this.maxvalue - this.minvalue) / this._maxright + this.minvalue);
    val = Math.round(val / this.unit) * this.unit;
    this._adjustHandle(val);

    if (val != this._lastValue) {
      this._lastValue = val;
      this.dispatchAction('value', String(val));
    } // if
  } // onmousemove


  _onmouseup(evt: MouseEvent) {
    /// <summary>Handle the mouse button up event. This handler will be attached to the document level.</summary>
    evt = evt || window.event;
    document.removeEventListener("mousemove", this._moveFunc);
    document.removeEventListener("mouseup", this._upFunc);
  } // onmouseup

  on_touchstart(evt: TouchEvent) {
    /// <summary>Handle the event when a touch operation starts.</summary>
    var t = evt.targetTouches[0].target;
    if (t == this._handle) {
      // this.TouchStart(evt);
      console.log('TouchStart');
    } // if
  } // ontouchstart()



}


// jcl.HSliderBehavior = {
//   /// <summary>This control implements is a horizontal moveable rectangle that acts as a slider.
//   /// It can be attached to an OpenAjax event and acts as a subscriber and publisher.</summary>
//   /// <example>A page that uses this control ist available at:<br />
//   /// <a href="http://www.mathertel.de/AJAXEngine/S03_AJAXControls/ConnectionsTestPage.aspx">
//   /// http://www.mathertel.de/AJAXEngine/S03_AJAXControls/ConnectionsTestPage.aspx</a></example>

//   _handle: null, /// <summary>Reference to the movable knob obj.</summary>
//   _lastValue: -1, /// <summary>last published value to avoid doublicate events.</summary>
//   _x: 0, /// <summary>Offset between mouse and the knob.</summary>
//   _maxright: 0, /// <summary>rightmost position of the knob.</summary>
//   _xOffset: 0, /// <summary>x-offset of the region the knob is allowed to be moved.</summary>

//   minvalue: 0, /// <summary>The value that is reached on the leftmost position of the knob.</summary>
//   maxvalue: 100, /// <summary>The value that is reached on the rightmost position of the knob.</summary>
//   unit: 1, /// <summary>The unit of the oublished values. All values can be divided by this value without any reminder
//   /// if the value is determined by using the HSlider.</summary>

//   eventname: "", /// <summary>The local or complete event name that is used for publishing OpenAjax events.</summary>

//   init: function() {
//     var p;
//     /// <summary>Initialze the JavaScript control.</summary>
//     this._removeTextNodes(this);

//     this.eventname = jcl.BuildFullEventname(this);

//     if (this.eventname) {
//       OpenAjax.hub.subscribe(this.eventname, this._handleEvent, this);
//     } // if

//     // find the moveable knob
//     this._handle = this.getElementsByClassName("knob")[0];
//     p = this._handle.parentNode;

//     this._maxright = p.offsetWidth - this._handle.offsetWidth;

//     this.minvalue = parseInt(this.minvalue);
//     this.maxvalue = parseInt(this.maxvalue);
//     this.unit = parseInt(this.unit);
//     this._lastValue = this.minvalue;
//   }, // init


//   // --- events

//   onmousedown: function(evt) {
//     /// <summary>Handle the event when the mouse button is pressed.</summary>
//     var t = window.event.srcElement;
//     var left = this._lastValue;

//     // check clicked element or the parents fur functionality.
//     while (t) {
//       if (t == this) {
//         // don't analyze further that the hst object
//         break;

//       } else if (t.classList.contains("minus")) {
//         left = parseInt(left) - this.unit;
//         if (left < this.minvalue) left = this.minvalue;

//       } else if (t.classList.contains("plus")) {
//         left = parseInt(left) + this.unit;
//         if (left > this.maxvalue) left = this.maxvalue;

//       } else if (t.classList.contains("knob")) {
//         this.MoveStart(evt);
//       } // if
//       t = t.parentElement;
//     } // while

//     if (left != this._lastValue) {
//       if ((this.eventname != null) && (this.eventname != "")) {
//         OpenAjax.hub.publish(this.eventname, left);
//       } // if
//       this._lastValue = left;
//     } // if
//   }, // onmousedown


//   ontouchstart: function(evt) {
//     /// <summary>Handle the event when a touch operation starts.</summary>
//     var t = evt.targetTouches[0].target;
//     if (t.className == "knob") {
//       this.TouchStart(evt);
//     } // if
//   }, // ontouchstart:


//   ontouchmove: function(evt) {
//     /// <summary>Handle the event when a touch point moves.</summary>
//     var mo = jcl.currentMoving;
//     if (mo != null) {
//       evt.preventDefault();

//       var left = evt.targetTouches[0].pageX - this._x - this._xOffset;
//       left = Math.min(this._maxright, Math.max(0, left));
//       this._handle.style.left = left + "px";

//       left = Math.round(left * (this.maxvalue - this.minvalue) / this._maxright + this.minvalue);
//       left = Math.round(left / parseInt(this.unit)) * parseInt(this.unit);

//       if (left != this._lastValue) {
//         if ((this.eventname != null) && (this.eventname != "")) {
//           OpenAjax.hub.publish(this.eventname, left);
//         } // if
//       } // if
//     } // if

//     this._lastValue = left;
//   }, // ontouchmove:


//   _onmousemove: function(evt) {
//     /// <summary>Handle the mouse button move event. This handler will be attached to the document level.</summary>
//     evt = evt || window.event;
//     jcl.currentMoving.MoveIt(evt);
//   }, // onmousemove


//   _onmouseup: function(evt) {
//     /// <summary>Handle the mouse button up event. This handler will be attached to the document level.</summary>
//     evt = evt || window.event;
//     jcl.currentMoving.MoveEnd(evt);
//   }, // onmouseup


//   // --- methods

//   MoveStart: function(evt) {
//     /// <summary>Start sliding the knob.</summary>
//     this._xOffset = 0;
//     var obj = this._handle.offsetParent;
//     while (obj != null) {
//       this._xOffset += obj.offsetLeft;
//       obj = obj.offsetParent;
//     } // while

//     // calculate mousepointer-knob delta
//     this._x = evt.clientX - (this._handle.offsetLeft + this._xOffset);

//     jcl.currentMoving = this; // make it globally evailable when mouse is leaving this object.
//     jcl.AttachEvent(document, "onmousemove", this._onmousemove);
//     jcl.AttachEvent(document, "onmouseup", this._onmouseup);
//     // cancel selecting anything
//     evt.cancelBubble = true;
//     evt.returnValue = false;
//   }, // MoveStart


//   TouchStart: function(evt) {
//     this._xOffset = 0;
//     var obj = this._handle.offsetParent;
//     while (obj != null) {
//       this._xOffset += obj.offsetLeft;
//       obj = obj.offsetParent;
//     } // while

//     // calculate mousepointer-knob delta
//     this._x = evt.targetTouches[0].pageX - (this._handle.offsetLeft + this._xOffset);
//     jcl.currentMoving = this;
//   }, // TouchStart


//   MoveIt: function(evt) {
//     /// <summary>Move the knob element and eventually publish a new event.</summary>
//     var left = evt.clientX - this._x - this._xOffset;
//     left = Math.min(this._maxright, Math.max(0, left));
//     this._handle.style.left = left + "px";

//     left = Math.round(left * (this.maxvalue - this.minvalue) / this._maxright + this.minvalue);
//     left = Math.round(left / parseInt(this.unit)) * parseInt(this.unit);

//     if (left != this._lastValue) {
//       if ((this.eventname != null) && (this.eventname != "")) {
//         OpenAjax.hub.publish(this.eventname, left);
//       } // if

//     } // if

//     this._lastValue = left;
//     // cancel selecting anything
//     evt.cancelBubble = true;
//     evt.returnValue = false;
//   }, // MoveIt


//   MoveEnd: function() {
//     /// <summary>Handle the end of a moving gesture.</summary>
//     if (this._handle != null) {
//       jcl.DetachEvent(document, "onmousemove", this._onmousemove);
//       jcl.DetachEvent(document, "onmouseup", this._onmouseup);
//       jcl.currentMoving = null;
//     } // if
//   }, // MoveEnd


//   // --- OpenAjax event handler ---

//   _handleEvent: function(eventName, eventData) {
//     /// <summary>Handle OpenAjax events.</summary>
//     var knob = this._handle;
//     if ((knob != null) && (this._lastValue != eventData)) {
//       this._lastValue = eventData;
//       eventData = eventData - this.minvalue;
//       eventData = Math.round(eventData * this._maxright / (this.maxvalue - this.minvalue));
//       eventData = Math.min(this._maxright, Math.max(0, eventData));
//       knob.style.left = eventData + "px";
//     } // if
//   }, // _handleEvent

//   _removeTextNodes: function(n) {
//       /// <summary>remove all textnodes from the control to avoid unwanted spaces.</summary>
//       var obj = n.firstChild;
//       while (obj != null) {
//         var nextObj = obj.nextSibling;
//         if (obj.nodeType == 3)
//           obj.parentNode.removeChild(obj);
//         obj = nextObj;
//       } // while
//     } // _removeTextNodes

// } // jcl.HSliderBehavior


// End.

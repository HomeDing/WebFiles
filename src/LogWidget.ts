// LogWidget.ts: Widget Behavior implementation for Log Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('log')
class LogWidgetClass extends GenericWidgetClass {
  filename: string | null = null;
  lineSVGObj: HTMLObjectElement | null = null;
  linesApi: any;
  lChart: any;

  connectedCallback(el: HTMLElement) {
    super.connectedCallback(el);
    this.lineSVGObj = el.querySelector('object');
    hub.subscribe(this.microid + '?*', this.newValue.bind(this), true);
  }

  loadData() {
    fetch(this.filename as string)
      .then(function(result) {
        return result.text();
      })
      .then(
        function(this: LogWidgetClass, pmValues: string) {
          var re = /^\d{2,},\d+/;
          var pmArray = pmValues.split('\n').filter(function(e) {
            return e.match(re);
          });

          this.linesApi.updateLineChartData(
            this.lChart,
            pmArray.map(function(v) {
              var p = v.split(',');
              return { x: p[0], y: p[1] };
            })
          );
        }.bind(this)
      );
  } // loadData()

  load() {
    if (!this.lineSVGObj || !this.lineSVGObj.getSVGDocument() || !(this.lineSVGObj.getSVGDocument() as any).api) {
      window.setTimeout(this.load.bind(this), 20);
      // alert("0:" + this.lineSVGObj.getSVGDocument()['api']);
    } else {
      // alert("0+s" + this.lineSVGObj.getSVGDocument['api']);
      // now setup
      this.linesApi = (this.lineSVGObj.getSVGDocument() as any).api;
      this.lChart = this.linesApi.addLineChart();
      this.linesApi.addVAxis();
      this.linesApi.addHAxis();
      this.loadData();
    }
  } // load()

  newValue(_path: string, key: string | null, value: string | null) {
    if (key === 'filename') {
      this.filename = value;
      this.load();
    }
  } // newValue()
}

// End.

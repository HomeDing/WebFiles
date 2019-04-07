// LogWidget.ts: Widget Behavior implementation for Log Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('log')
class LogWidgetClass extends GenericWidgetClass {
  filename: string = null;
  lineSVGObj: HTMLObjectElement;
  linesApi: any;
  lChart: any;

  connectedCallback(el: HTMLElement) {
    super.connectedCallback(el);
    this.lineSVGObj = el.querySelector('object');
    hub.subscribe(this.microid + '?*', this.newValue.bind(this), true);
  }

  onclick(e: MouseEvent) {
    var src: HTMLElement = <HTMLElement>e.srcElement;
  }

  loadData() {
    fetch('/pmlog.txt')
      .then(function(result) {
        return result.text();
      })
      .then(function(pmValues) {
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
      }.bind(this));
  } // loadData()

  load() {
    if (this.lineSVGObj.readyState !== 4) {
      window.setTimeout(this.load.bind(this), 20);
    } else {
      // now setup
      this.linesApi = this.lineSVGObj.getSVGDocument()['api'];
      this.lChart = this.linesApi.addLineChart();
      this.linesApi.addVAxis();
      this.linesApi.addHAxis();
      this.loadData();
    }
  } // load()

  newValue(path: string, key: string, value: string) {
    if (key === 'filename') {
      //
      this.filename = value;
      this.load();
      // alert(value);
    }
  }
}

// End.

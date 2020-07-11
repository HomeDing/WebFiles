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
  api: any;
  lChart: any;

  connectedCallback() {
    super.connectedCallback();
    this.lineSVGObj = this.querySelector('object');
    hub.subscribe(this.microid + '?*', this.newValue.bind(this), true);
  }

  loadData() {
    fetch(this.filename as string)
      .then(function (result) {
        return result.text();
      })
      .then(
        function (this: LogWidgetClass, pmValues: string) {
          const re = /^\d{2,},\d+/;
          const pmArray = pmValues.split('\n').filter(function (e) {
            return e.match(re);
          });

          this.api.updateLineChartData(
            this.lChart,
            pmArray.map(function (v) {
              const p = v.split(',');
              return { x: p[0], y: p[1] };
            })
          );
        }.bind(this)
      );
  } // loadData()


  /** get the API from the SVG object when loaded */
  loadSVG() {
    let done = false;

    if (this.lineSVGObj) {
      let svgObj = null;
      try {
        svgObj = <any>(this.lineSVGObj.getSVGDocument());
      } catch (err) { }

      if ((svgObj) && (svgObj.api)) {
        // now setup
        this.api = (this.lineSVGObj.getSVGDocument() as any).api;
        this.lChart = this.api.addLineChart();
        this.api.addVAxis();
        this.api.addHAxis();
        this.loadData();
        done = true;
      }
    }

    if (!done) {
      // try again some time later
      window.setTimeout(this.loadSVG.bind(this), 1000);
    }
  } // loadSVG()


  newValue(_path: string, key: string | null, value: string | null) {
    if (key === 'filename') {
      this.filename = value;
      this.loadSVG();
    }
  } // newValue()
}

// End.

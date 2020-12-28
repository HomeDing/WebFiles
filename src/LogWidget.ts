// LogWidget.ts: Widget Behavior implementation for Log Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

// workaround for implemented but unknown allSetteled
declare interface PromiseConstructor {
  allSettled(promises: Array<Promise<any>>): Promise<Array<{ status: 'fulfilled' | 'rejected', value?: any, reason?: any }>>;
}

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
    const fName = (this.filename as string);
    let allData = '';

    const p1 = fetch(fName, { cache: 'no-store' })
      .then(function (result) {
        return result.text();
      })
      .then(function (txt) {
        allData = allData + '\n' + txt;
      });

    const p2 = fetch(fName.replace('.txt', '_old.txt'), { cache: 'no-store' })
      .then(function (result) {
        return result.text();
      })
      .then(function (txt) {
        allData = txt + '\n' + allData;
      })
      .catch(function () {
      });
    Promise.allSettled([p1, p2]).then(function (this: LogWidgetClass) {
      const re = /^\d{4,},\d+/;
      const pmArray = allData.split('\n').filter(function (e) {
        return e.match(re);
      });

      this.api.draw(
        this.lChart,
        pmArray.map(function (v) {
          const p = v.split(',');
          return { x: p[0], y: p[1] };
        })
      );
    }.bind(this));
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
        this.lChart = this.api.addChart('line', { linetype: 'line' });
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

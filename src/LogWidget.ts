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
  xFormat!: string;
  yFormat!: string;
  api: any;
  lChart: any;

  connectedCallback() {
    super.connectedCallback();
    this.lineSVGObj = this.querySelector('object');
    this.xFormat = 'datetime';
    this.yFormat = 'num';
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
        this.lChart = this.api.add('line', { linetype: 'line' });
        this.api.add(['VAxis',
          { type: 'hAxis', options: { format: 'datetime' } },
          { type: 'indicator', options: { xFormat: this.xFormat, yFormat: this.yFormat } },
        ]);
        this.loadData();
        done = true;
      }
    }

    if (!done) {
      // try again some time later
      window.setTimeout(this.loadSVG.bind(this), 1000);
    }
  } // loadSVG()


  newData(path: string, key: string | null, value: string | null) {
    super.newData(path, key, value);
    if (key === 'filename') {
      this.filename = value;
      this.loadSVG();
    } else if (key === 'xformat') {
      this.xFormat = <string>value;
    } else if (key === 'yformat') {
      this.yFormat = <string>value;
    }
  } // newValue()
}

// End.

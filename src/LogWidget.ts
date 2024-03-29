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
  private _fName?: string;
  private _SVGObj!: HTMLObjectElement | null;
  private _lineType!: string;
  private _xFormat!: string;
  private _yFormat!: string;
  private _api: any;
  private _chart: any;

  override connectedCallback() {
    super.connectedCallback();
    this._SVGObj = this.querySelector('object');
    this._lineType = 'line';
    this._xFormat = 'datetime';
    this._yFormat = 'num';
  }

  loadData() {
    const fName = (this._fName as string);
    let allData = '';

    const p1 = fetch(fName, { cache: 'no-store' })
      .then(res => {
        if (res.ok) { return res.text(); }
        throw new Error();
      })
      .then(function(txt) {
        allData = allData + '\n' + txt;
      });

    const p2 = fetch(fName.replace('.txt', '_old.txt'), { cache: 'no-store' })
      .then(res => {
        if (res.ok) { return res.text(); }
        throw new Error();
      })
      .then(function(txt) {
        allData = txt + '\n' + allData;
      });
    Promise.allSettled([p1, p2]).then(function(this: LogWidgetClass) {
      const re = /^\d{4,},\d+/;
      const pmArray = allData.split('\n').filter(e => e.match(re));

      this._api.draw(
        this._chart,
        pmArray.map(v => {
          const p = v.split(',');
          return { x: p[0], y: p[1] };
        })
      );
    }.bind(this));
  } // loadData()


  /** get the API from the SVG object when loaded */
  loadSVG() {
    let done = false;

    if (this._SVGObj) {
      let svgObj = null;
      try {
        svgObj = <any>(this._SVGObj.getSVGDocument());
      } catch (err) { }

      if ((svgObj) && (svgObj.api)) {
        // now setup
        this._api = (this._SVGObj.getSVGDocument() as any).api;
        this._chart = this._api.add('line', { linetype: this._lineType });
        this._api.add(['VAxis',
          { type: 'hAxis', options: { format: 'datetime' } },
          { type: 'indicator', options: { xFormat: this._xFormat, yFormat: this._yFormat } },
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


  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key === 'filename') {
      this._fName = value;
      this.loadSVG();
    } else if (key === 'xformat') {
      this._xFormat = value;
    } else if (key === 'yformat') {
      this._yFormat = value;
    } else if (key === 'linetype') {
      this._lineType = value;
    }
  } // newValue()
}

// End.

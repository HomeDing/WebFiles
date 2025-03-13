// LogWidget.ts: Widget Behavior implementation for Log Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

/**
 * A widget class for displaying log data in a line chart.
 * 
 * @remarks
 * This widget extends GenericWidgetClass and is decorated with @MicroControl('log').
 * It manages a line chart component that can display time series data loaded from text files.
 * 
 * @property {string | undefined} _fName - The filename of the log data to load
 * @property {HTMLElement | any | null} _chart - Reference to the u-linechart element
 * @property {string} _lineType - The type of line to display ('line' by default)
 * @property {string} _xFormat - Format for x-axis values ('datetime' by default)
 * @property {string} _yFormat - Format for y-axis values ('num' by default)
 * @property {boolean} _isSetup - Tracks if the chart is configured
 * @property {boolean} _isDirty - Tracks if the chart needs updating
 */
@MicroControl('log')
class LogWidgetClass extends GenericWidgetClass {
  private _fName?: string;
  private _chart!: HTMLElement | any | null;
  private _lineType!: string;
  private _xFormat!: string;
  private _yFormat!: string;
  private _isSetup = false; // chart is configured
  private _isDirty = false; // drawing needs some update

  override connectedCallback() {
    super.connectedCallback();
    this._chart = this.querySelector('u-linechart');
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
      const pmArray = allData
        .replace(/\r/g, '')
        .split('\n')
        .filter(e => e.match(/^\d{4,},\d+/))
        .map(v => {
          const p = v.split(',');
          return { x: p[0], y: p[1] };
        });

      this._chart.draw(pmArray);
    }.bind(this));
  } // loadData()


  /** get the API from the SVG object when loaded */
  loadSVG() {
    if (this._chart) {
      customElements.whenDefined('u-linechart').then(() => {
        if (!this._isSetup) {
          // now setup
          this._chart.add('line', { linetype: this._lineType });
          this._chart.add([
            { type: 'vAxis' },
            { type: 'hAxis', options: { format: 'datetime' } },
            { type: 'indicator', options: { xFormat: this._xFormat, yFormat: this._yFormat } },
          ]);
          this._isSetup = true;
        }
        // load data
        this.loadData();
      });
    }
  } // loadSVG()


  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key === 'filename') {
      this._fName = value;

    } else if (key === 'xformat') {
      this._xFormat = value;
    } else if (key === 'yformat') {
      this._yFormat = value;
    } else if (key === 'linetype') {
      this._lineType = value;
    }

    if (!this._isDirty) {
      this._isDirty = true;
      this.loadSVG();
    }
  } // newValue()
}

// End.

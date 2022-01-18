class TableSortable extends HTMLTableElement {

  sortAsc = ' [A]';
  sortDesc = ' [V]';

  constructor() {
    // Always call super first in constructor
    super();
  } // constructor


  connectedCallback() {
    // document.addEventListener("DOMContentLoaded", () => {
    //   this.querySelectorAll('th[sort]')
    //     .forEach(he => {
    //       he.appendChild(document.createTextNode(this.sortAsc));
    //     });
    // })
    this.addEventListener("click", this.on_click);
  }


  compareText(a, b) {
    if (a.key < b.key) { return -1; }
    else if (a.key > b.key) { return 1; }
    else { return 0; }
  } // compareText


  compareDate(a, b) {
    var aDate = new Date(a.key);
    var bDate = new Date(b.key);
    if (aDate < bDate) { return -1; }
    else if (aDate > bDate) { return 1; }
    else { return 0; }
  } // compareDate


  sortTable(col, fCmp) {
    var /** @type HTMLTableSectionElement */ body = this.querySelector('tbody');

    var data = [];
    body.querySelectorAll('tr').forEach(tr => {
      data.push({
        key: tr.children[col].innerText.toLowerCase(),
        val: tr
      })
    });
    data.sort(fCmp).forEach(r => body.appendChild(r.val));
  } // sortTable()


  elementIndex(/** @type HTMLElement */parent, /** @type HTMLElement */node) {
    var idx = -1;
    if (parent && node) {
      var e = parent.firstElementChild;
      while (e) {
        idx++;
        if (e === node) { return (idx); }
        e = e.nextElementSibling;
      }
    }
    return (-1);
  } // elementIndex()


  on_click(/** @type MouseEvent */e) {
    var tar = /** @type HTMLElement */(e.target);

    if ((tar.tagName === 'TH') && (tar.getAttribute('sort') !== null)) {
      var n = this.elementIndex(tar.parentElement, tar);
      var sortType = tar.getAttribute('sort').toLowerCase() || 'text';
      if (sortType == 'text') {
        this.sortTable(n, this.compareText);
      } else if (sortType == 'date') {
        this.sortTable(n, this.compareDate);
      }
    } // if
  } // on_click()

} // class

customElements.define('table-sortable', TableSortable, { extends: 'table' });
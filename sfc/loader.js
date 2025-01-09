// loader.js
// 
// This is a loader implementation to load Single File Components (SFC) from a web server
// and use the as regular web components.
// Copyright

// The UComponent class acts as a intermediate class between user defined SFC and the generic HTMLElement class.
// It implements the generation of the shadow dom and css according to the style and template.
class UComponent extends HTMLElement {
  constructor() {
    super();

    // create inner / document Style
    const c = this.constructor;
    const shadow = this.attachShadow({ mode: 'open' });

    if (c.uStyle) {
      if (c.uStyle.hasAttribute('scoped')) {
        shadow.appendChild(c.uStyle.cloneNode(true));
      } else {
        document.head.appendChild(c.uStyle.cloneNode(true));
      }
    }

    // create shadow DOM
    if (c.uTemplate) {
      shadow.appendChild(document.importNode(c.uTemplate.content, true));
    }
  } // constructor()

  // Web Component is initiated and connected to a page.
  // * load template and css
  // * further initialization by using the init() callback
  connectedCallback() {
    // this.debug('connectedCallback()');
    this.super = Object.getPrototypeOf(this);
    const def = this.constructor;

    // add event listeners
    Object.getOwnPropertyNames(def.prototype).forEach(key => {
      const fn = def.prototype[key];

      if (key === 'onTouchstart') {
        this.addEventListener('touchstart', fn.bind(this), { passive: true });

      } else if (key.startsWith('on')) {
        this.addEventListener(key.substring(2).toLowerCase(), fn.bind(this), false);
      }
    });

    // add attribute data
    Object.entries(def).forEach(([key, value]) => {
      if (value == null || value.constructor !== Function) {
        // set a default-value
        if (!this[key]) {
          this[key] = value;
        }

      } else {
        // attach method
        this[key] = value;
      }
    });

    if (document.readyState == 'loading') {
      window.addEventListener('DOMContentLoaded', this.init.bind(this));
    } else {
      window.requestAnimationFrame(this.init.bind(this));
    }
  }

  adoptedCallback() {
    // this.info("adoptedCallback", evt);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // this.debug("attributeChanged", name, oldValue, newValue);
  }

  // logging functions
  info() {
    console.info(`U::${this.tagName}`, ...arguments);
  };

  debug() {
    console.debug(`U::${this.tagName}.${this.id}`, ...arguments);
  };

  // The init function is called by UComponent when the whole DOM of the SFC is available. 
  init() {
    // debugger;
  };
} // class UComponent


window.loadComponent = (function() {

  async function fetchSFC(tagName, folder = '') {
    const sfc = { tagName, template: undefined, style: undefined, def: undefined };

    if (folder === undefined) folder = '';
    if (folder.length > 0 && (!folder.endsWith('/'))) folder += '/';
    const url = folder + tagName + '.vue';
    console.log(url);

    // get DOM from sfc-file
    const dom = await fetch(url)
      .then(response => response.text())
      .then(html => (new DOMParser()).parseFromString(html, 'text/html'));

    // save template and css for later
    sfc.template = dom.querySelector('template');
    sfc.style = dom.querySelector('style');

    // create class from script
    const scriptObj = dom.querySelector('script');
    const jsFile = new Blob([scriptObj.textContent], { type: 'application/javascript' });
    const module = await import(URL.createObjectURL(jsFile));

    sfc.def = module.default;

    return (sfc);
  }; // fetchSFC()


  function registerComponent({ tagName, template, style, def }) {
    console.debug('SFC', `registerComponent(${tagName})`);

    // make template and style available to object constructor()
    def.uTemplate = template;
    def.uStyle = style;
    customElements.define(tagName, def);
    console.debug('SFC', `${tagName} defined.`);
  } // registerComponent();

  function loadComponent(urlList, folder) {
    const urls = urlList.split(',');
    return (Promise.all(urls.map((u) => fetchSFC(u, folder).then(registerComponent))));
  }

  return loadComponent;
}());

<!--
Implementation of a web component to render markdown in the browser.

<u-markdown style="... "></u-markdown>

The Markdown component implements displaying the result from compiling markdown to HTML.

Markdown can be injected by 2 methods:

* Loading a *.md file from the same web server. After the file is loaded it gets compiled inti HTML and displayed.
* Passing markdown text directly to the component by setting the `textContent` property.

## HTML Attributes

none. typically the style needs to be specified by using css rules.

## JavaScript accessible attributes

* **`src`** -- The URL of the markdown file to be loaded and displayed.
* **`textContent`** -- The markdown text to be compiled and displayed.

the markdown-it.js is required to be loaded. Ir can be found in https://markdown-it.github.io/.

Open Topics:

The foldername /sfc/ is hardcoded. It should be replaced by a variable / placeholder.

References: 
* https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
* https://zerodevx.github.io/zero-md/
* requestIdleCallback, SetTimeout VS RequestAnimationFrame

-->



<template>
  <script src="/sfc/markdown-it.js"       defer onload="this.isLoaded = true;"></script>
  <script src="/sfc/markdown-it-attrs.js" defer onload="this.isLoaded = true;"></script>
  <div></div>
</template>

<style scoped>
:host {
  display: block;
  height: 100%;
}
</style>

<script>
export default class MyMarkdown extends UComponent {
  static get observedAttributes() {
    return ["textcontent", "src"];
  }
  srcLink = undefined;

  // text from markdown file or direct text
  srcText = undefined;
  // text from markdown file or direct text
  srcText = null;

  // Markdown renderer
  md = null;

  // fetch file content
  fetchMarkdown() {
    const oDiv = this.shadowRoot.querySelector('div');
    oDiv.textContent = '(process url...)';

    fetch(this.srcLink)
      .then(response => response.text())
      .then(text => {
        this.srcText = text;
        this.renderMarkdown();
      });
  }

  // render markdown
  renderMarkdown() {
    const oDiv = this.shadowRoot.querySelector('div');
    if (!this.md) {
      window.markdownItAttrs

      this.md = window.markdownit({
        html: true,
        linkify: true,
        typographer: true
      })
      .use (window.markdownItAttrs);
    }
    oDiv.innerHTML = this.md.render(this.srcText);
  }

  // process markdown
  process() {
    console.debug("process...");
    if (window.markdownit) {
      if (this.srcText) {
        this.renderMarkdown();
      } else if (this.srcLink) {
        this.fetchMarkdown();
      }
    }
  }


  init() {
    // The markdown script will be available after loading it. Then processing might be required.
    const oScript = this.shadowRoot.querySelectorAll('script');
    let loaded = true;

    for (const s of oScript) {
      if (!s.isLoaded) {
        loaded = false;
        s.addEventListener("load", () => { this.init(); });
      }
    }

    if (loaded) {
      this.process();
    }
  } // init()


  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue) {
      this.srcLink = this.srcText = undefined;
      if (name === 'src') {
        this.srcLink = newValue;
        this.process();

      } else if (name === 'textcontent') {
        this.srcText = newValue;
        this.process();
      }
    }
  } // attributeChangedCallback()

}
</script>
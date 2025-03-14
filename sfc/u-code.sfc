<!--

Implementation of a web component that enriches the functionality of regular <code> elements
  to support copying the displayed code to the clipboard.

A copy icon is shown on the right upper corner that is animated for some milliseconds to show that the clipboard is updated.

<code is='u-code'> ... </code>

-->

<style>
  code[is="u-code"] {
    position: relative;
    color: red;

    &::after {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 32px;
      height: 32px;
      content: "";
      background-repeat: no-repeat;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><path d='M30 36v6H6V18v0h6m6-12h24v24H18z' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/></svg>");
    }

    &.done::after {
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><path d='M8 26L 20 36 L 40 8' fill='none' stroke='green' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/></svg>");
    }
}
</style>

<script extends="code">
  export default class UCode extends HTMLElement {

    // handle the click on the copy icon
    #onclick(evt) {
      const box = this.getBoundingClientRect();
      // check if clicked on the copy icon
      if ((evt.clientX > box.right - 32) && (evt.clientY < box.top + 32)) {
        navigator.clipboard.writeText(this.innerText);
        // show 'done' for some time
        this.classList.add('done');
        window.setTimeout(()=> this.classList.remove('done'), 900)
      }
    } // #onclick()

    // setup processing click events. 
    connectedCallback() {
      this.addEventListener('click', this.#onclick);
    } // connectedCallback()
  }
</script>
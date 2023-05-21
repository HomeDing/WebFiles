# CSS Layout of the micro frontends and Documents

## doc.scss

Tables:

Cards:
  .plaincard // card with text only
  .imgcard // picture with 4:3 ratio + text
  .iconcard  // cards with icon (svg)

Images for markdown documentation with widths:

like `![Image text](/boards/photo.jpg "w600")`

* img[title='w200'] { width: 200px; }
* img[title='w400'] { width: 400px; }
* img[title='w600'] { width: 600px; }

.warning {
  padding: 0.2rem;
  border-radius: 0.4rem;
}

@print rules for printing without background

## iot.scss

// <nav> is a vertical menu that can slide in and out by using some scripting.
// <nav> is used together with <main> for content
// `inpage` class: nav is beside main content, not overlap
// open class: nav is visible, maybe main needs to shift


## base




## See also

<https://every-layout.dev/layouts/stack/>


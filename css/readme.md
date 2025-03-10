# Style Toolkit

This folder contains the modules of the style toolkit used for the micro frontends of the iot devices and the style for
the documents based on the scss formats and compiled inti plain css files.

The modules can be combined into a single css file by including the required modules for the use-case.  This is done in
the scss files in the root of the project.

| assembly  | base  | page  |  doc  | display | dialog |
| --------- | :---: | :---: | :---: | :----: | :----: |
| docstyle  |   X   |   X   |   X   |        |        |
| iotstyle  |   X   |   X   |       |   X    |        |
| ministyle |   X   |   X   |       |        |        |

The `docstyle` is created for text-heavy pages.  It is a variant that supports flowing content in the main sections for
writing the documentation and blogs.

Compiling the modules into a StyleSheet is done by using the sass compiler:

`sass docstyle.scss:docstyle.css --style=compressed`

The npm build tasks support compiling and watching for dev purpose.


## Base Module{#identifier cssselector}

The base module is implemented in `base.scss` implements the basic css rules used in any of the cases.

* html base settings (reset)
* basic text spacing (h1)
* base colors
* semantic colors

The sizing and coloring implementation is detailled below.


## Page Module

The base module is implemented in `base.scss` implements a page-level responsive layout system used in all the cases. It is activated by
using the `sitelayout` class on the body element.

The layout system can be used for the full-page boards of iot devices but also for the document style web sites.

It defines the following (partially optional) page-level areas:

`<header>` -— This area is the place to put the web site logo and top level navigations.

`<nav class='navbar'>` -— This optional area is the place to add clickable items to start functionality other than navigation like controlling page level processes.

`<nav class='menu'>` -— This optional area is made to provide more detailled navigation within the domain. This may be the

`<main>` -— This area is made for a comfortable reading experience and has enough space for good reading as well as horizontal cards.

`<nav class='sidebar'>` -— This optional area is made to provide more detailled navigation within the domain. This may be the

`<footer>` -— This optional area exists for web site references like copyright and legal statements.


## Doc Module

The doc module is implemented in `doc.scss` implements css rules used for document formatting.

* general text containers
* table formatting
* links formatting
* mark links to external sites
* code formatting

Tables:

Cards:
  .plaincard // card with text only
  .imgcard // picture with 4:3 ratio + text
  .iconcard  // cards with icon (svg)

Images for markdown documentation with widths:

like `![Image text](/boards/photo.jpg "w600")`

like `![Image text](/boards/photo.jpg){style=width:600px}`

* img[title='w200'] { width: 200px; }
* img[title='w400'] { width: 400px; }
* img[title='w600'] { width: 600px; }

* img{title='w600'} { width: 600px; }

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


## doc module


## See also

<https://every-layout.dev/layouts/stack/>


## Menu

The menu appears on the left side of the page and operates independently from the `sitelayout` class-based page layout.

Since many implementations must work in space-constrained environments, the menu can either overlay the main content or appear beside it, depending on available space.

The show/hide mechanism is implemented using CSS-only with the modern popover feature (available since 2024). No JavaScript is required. CSS rules and attributes control the menu's display behavior, while opening and closing animations are handled through CSS transitions.


### Menu Area

Any block-level element (typically `<div>` or `<nav>`) can serve as the menu area. It must:

* Have the class `menu`
* Have a unique ID
* Include the `popover` attribute

``` html
<nav popover='auto' id='my-menu' class='menu'>
  <!-- menu content -->
  <a href="...">...</a>
  <a href="...">...</a>
</nav>
```


### Menu Button

A button to toggle the menu typically resides in the navbar area. A `<button>` element is required as the CSS popover mechanism only works with buttons.

``` html
<button id="menu" popovertarget="my-menu">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="white" d="M0 8h48v6H0zm0 13h48v6H0zm0 13h48v6H0z" />
  </svg>
</button>
```

The button's ID is necessary to hide it when there's sufficient space to display the menu permanently.


### Menu CSS

The CSS implementation defines parameters for the menu's display behavior. By default, the menu is shifted left, out of view. The `popover-open` rule, automatically triggered by the popover mechanism, shifts the menu into view.

When sufficient page width is available:

* The entire HTML body shifts right by the menu's width
* The menu becomes permanently visible
* The menu button in the navbar is hidden


``` CSS
.menu {
  position: absolute;
  display: block;
  border: 1px solid var(--menu-color);
  background-color: var(--menu-back);
  color: var(--menu-color);
  width: var(--menu-width);
  min-height: 360px;
  z-index: 1;
  top: 6.2rem;
  left: 0;
  transition: all var(--transition);
  padding: var(--menu-padding);
  margin: 0;
  transform: translateX(calc(0px - var(--menu-width)));

  &:popover-open {
    transform: translateX(0px);
  }

  &::backdrop {
    background-color: rgb(200 200 200 / 0.7);
  }

  a,
  a:hover {
    text-decoration: none;
  }
}

@media (width > 1200px) {
  .menu {
    transform: translateX(0px);
  }
  
  
  :root {
    padding-left: var(--menu-width);
    transition: padding-left var(--transition);
  }

  button[popovertarget] {
    display: none;
  }
}  
```

### Menu JavaScript

none.


## Size matters

When designing HTML areas for reading text,\
it's important to consider both the width of the text container and the text size to ensure readability and a comfortable reading experience.

`Width` —- A line length of 50-75 characters per line, including spaces is considered for a good reading.  The standard
width of the main area is therefore set to 42em ~ 672px including some padding resulting in about 80 characters.  This size also
is usable on almost all mobile devices.

`Font Size` -— The text resolution that is defined by the default font-size on a device is not changed.  All font-sizes
of the text containing elements are implemented by relative factors or are based on the rem units.  The line-height is
set to 1.2 for all text.


## Color matters

Unlike sizing properties, colors can be defined using CSS variables exclusively, as they don't affect element
dimensions, positioning, or sizes.  This approach enhances the reusability of the style toolkit and enables easy
customization of the color scheme.

The color scheme is based on the light and dark modes, which can be toggled by the user or automatically based on the
user's preferences.

The page-level areas have their specific coloring defined by using css variables:

``` css
:root {
  --back: light-dark(hsl(220deg 2% 85%), hsl(220deg 2% 15%));
  --color: light-dark(hsl(220deg 0 10%), hsl(220deg 0 90%));

  --header-back: var (--back);
  --header-color: var (--color);

  --navbar-back: hsl(220deg 80% 30%);
  --navbar-color: white;

  --main-back: light-dark(hsl(220deg 0 90%), hsl(220deg 0 10%));
  --main-color: var(--color);

  --header-back: var (--back);
  --header-color: var (--color);

  --footer-back: var(--back);
  --footer-color: var(--color);

  --menu-back: light-dark(white, black);
  --menu-color: light-dark(black, white);
}
```

As these color values are defined at the `:root` level and can be redefined through additional page-level assignments,
enabling easy style adaptations without recompiling the CSS.

```html
<svg id="themebutton" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<path fill="white" d="M24 1c-13 0-23 10-23 23s10 23 23 23s23-11 23-23s-11-23-23-23z M24 43V5c10 0 19 10 19 19s-9 19-19 19z" />
</svg>
```


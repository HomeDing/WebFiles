# CSS Implementation Instructions

This guide describes where CSS belongs in this project, how the Sass stylesheets are assembled, and how to implement and
check changes to controls such as buttons, labels, and inputs.

## Source files and assemblies

The files in `css/` are Sass modules. The root-level Sass files assemble them into the stylesheets used by the project.
Edit the source module rather than a generated CSS file.

| File            | Purpose                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| `css/base.scss` | Shared reset, design tokens, colors, typography, and common elements      |
| `css/page.scss` | Shared page layout                                                        |
| `css/form.scss` | Shared form controls, button variants, sliders, form layouts, and dialogs |
| `css/iot.scss`  | Device UI and IoT-specific controls                                       |
| `css/doc.scss`  | Documentation styles                                                      |
| `css/card.scss` | Card components                                                           |
| `css/code.scss` | Code presentation                                                         |
| `iotstyle.scss` | Assembles `base`, `page`, `card`, and `iot`                               |
| `docstyle.scss` | Assembles `base`, `page`, `doc`, `card`, `code`, and `iot`                |

Use Sass `@use` for modules and namespace Sass variables when referencing them. Shared runtime values belong in the CSS
custom properties defined in `css/base.scss`; Sass variables are for values resolved during compilation. Shared form
selectors belong in `css/form.scss`, while `css/iot.scss` and `css/doc.scss` both include that module.

The assemblies compile to `iotstyle.css` and `docstyle.css`. Compiled styles are included in device packages, so test
changes on the supported browsers and target screen sizes. Device package limits apply to all packed assets, not CSS
alone. The documented style payload targets are approximately 50 KB for `dist/` and 10 KB for `dist-mini/`; standard
packages must stay within 1 MB and minimal packages within 128 KB.

## CSS Variables

The base stylesheet defines runtime css variables such as:

```css
--text-gap
--input-padding-block
--input-padding-inline
--input-border-width
```

Use these for control spacing and borders instead of repeating unrelated literal values. The standalone
`css/button-pill.htm` page demonstrates one possible control treatment; its inline styles are not part of either Sass
assembly. Its lime, yellow-green, and silver backgrounds are visual aids, not production colors.

## Buttons, labels, and icons

- Keep native `<button>` elements for actions. Use a text wrapper such as `<span>` alongside an SVG when a button has
  both an icon and text. This gives flex layout a consistent element for the text and makes the `gap` explicit.
- Use `display: inline-flex` and `align-items: center` to align a control's contents. Use `gap: var(--text-gap)` for
  spacing between content items.
- Size a square SVG icon relative to the text line using `width` and `height` of `1lh`, and prevent it from shrinking
  with `flex: none`.
- Set control `line-height` deliberately, commonly by inheriting it, when matching the height of buttons, labels, and
  inputs. Native controls may retain a browser-default `line-height: normal` even when their font size is inherited.
- `vertical-align` aligns inline controls with neighboring inline content; it does not align the contents inside a
  control. Use `vertical-align: bottom` when their outer bottom edges should line up.
- For pill buttons, calculate the radius from the full outer height: content line-height plus block padding and borders.
  Keep the formula tied to the padding and border css variables so it stays correct when those values change.
- CSS `:first-child` and `:last-child` match element children, not text nodes. Wrap button text in an element when icon
  spacing or icon-edge adjustments depend on child order. Avoid using `:only-child` to distinguish icon-only buttons
  from buttons that have unwrapped text.
- Labels have no border by default. If a label must match a bordered button's outer height, account for the button
  border in the label's block padding and use the same line-height.

## Build and validation

After changing a Sass module, run:

```sh
npm run build:css
npm run test:css
```

The build compiles `docstyle.scss` and `iotstyle.scss`; the CSS test script runs Stylelint on `css/*.scss`. The standalone
`css/button-pill.htm` demo is not compiled or linted by these commands, so check it in a browser when changing its
inline styles.

Use `npm run pack:dist` and `npm run pack:minimal` to check the complete package sizes against their limits.

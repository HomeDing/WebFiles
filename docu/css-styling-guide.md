# CSS Styling Guide: Documents and Boards

## Overview

The HomeDing project uses **SCSS** (Sass) for styling, compiled into two main CSS files:

* **`iotstyle.css`** — For IoT dashboards and device boards (cards, interactive elements)
* **`docstyle.css`** — For documentation and text-heavy pages (layouts, typography)

This guide explains the CSS architecture, how to use styles in your HTML files, and how to customize styling for boards and documents.

---

## 1. SCSS File Structure

The CSS system is modular, organized in `/css/`:

| File          | Purpose                                                  |
| ------------- | -------------------------------------------------------- |
| `base.scss`   | Colors, typography, CSS variables (foundation)           |
| `page.scss`   | Layout structure (header, navbar, main, sidebar, footer) |
| `card.scss`   | Card container system (grid, flex layouts)               |
| `iot.scss`    | IoT-specific elements (buttons, forms, active states)    |
| `doc.scss`    | Document and markdown layouts                            |
| `code.scss`   | Code blocks and syntax highlighting                      |
| `extras.scss` | Additional utilities                                     |

### Build Process

```bash
# Compile SCSS to CSS
npm run build:css

# Watch for changes during development
npm run build:css-watch

# Lint SCSS
npm run test:css
```

**Output:**

* `docstyle.scss` → Imports (base, page, card, doc, code, extras) → `docstyle.css`
* `iotstyle.scss` → Imports (base, page, card, iot, extras) → `iotstyle.css`

---

## 2. Choosing the Right Stylesheet

### Use `iotstyle.css` for

* Device dashboards and control boards
* Interactive IoT UI with status displays
* Card layouts for device management
* Forms, buttons, input controls, ranges
* Active/inactive state styling for switches and toggles

**Example pages:** `board.htm`, `portal.htm`, device-specific UIs

```html
<head>
  <link rel="stylesheet" href="/iotstyle.css" />
</head>
```

### Use `docstyle.css` for

* Documentation pages and help content
* Markdown-generated content
* Text-heavy information pages
* Code examples and documentation blocks
* Alert/blockquote sections (tip, note, warning, caution)

**Example pages:** `README` pages, help documentation, reference guides

```html
<head>
  <link rel="stylesheet" href="/docstyle.css" />
</head>
```

---

## 3. CSS Variables System (Theming)

All variables are defined in `base.scss` `:root` section and can be customized globally or per-page.

### Core Theme Variables

```css
:root {
  --back:  /* page background color */
  --color: /* text/foreground color */
  --focus: /* focus color for interactive elements (default: blue) */

  /* Status/semantic colors */
  --success-hue: 80deg;
  --success-back: hsl(var(--success-hue) 90% 75%); /* light green */
  --success-line: hsl(var(--success-hue) 90% 40%); /* dark green */

  --warning-hue: 40deg;
  --warning-back: hsl(var(--warning-hue) 90% 75%); /* light yellow */
  --warning-line: hsl(var(--warning-hue) 90% 40%); /* dark orange */

  --error-hue: 0deg;
  --error-back: hsl(var(--error-hue) 90% 75%); /* light red */
  --error-line: hsl(var(--error-hue) 90% 40%); /* dark red */
}
```

### Card System Variables

```css
:root {
  --card-width: 280px; /* Standard card width */
  --card-gap: 16px; /* Spacing between cards */
  --card-height: 320px; /* Fixed or variable height */
  --card-back: white; /* Card background */
  --card-color: var(--main-color);
  --card-head: hsl(220 20% 80%); /* Header background */
  --card-head-active: hsl(220 80% 80%); /* Active header */
  --card-border: none;
  --card-padding: 0.5em;
  --card-image-size: 120px;
  --card-icon-size: 2.75em;
  --card-radius: 1em; /* Border radius */
}
```

### Layout Variables

```css
:root {
  --sidebar-width: 14em;
  --main-width: 42em;
  --layout-gap: 1em;
  --layout-padding: 0.5em;

  --header-back: var(--back);
  --header-color: var(--color);

  --main-back: light-dark(hsl(220 0 90%), hsl(220 0 10%));
  --main-color: var(--color);

  --navbar-back: #0066cc; /* Primary blue */
  --navbar-color: white;
  --navbar-padding: var(--layout-padding);

  --footer-back: var(--back);
  --footer-color: var(--color);
}
```

---

## 4. Page Layout System

The page structure uses semantic HTML with CSS Grid/Flexbox for automatic responsiveness.

### Basic Page Structure

```html
<body class="sitelayout">
  <header>
    <h1>Page Title</h1>
  </header>

  <nav class="navbar">
    <button id="menu">☰</button>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>

  <nav class="sidebar">
    <li><a href="#section1">Section 1</a></li>
    <li><a href="#section2">Section 2</a></li>
  </nav>

  <main>
    <!-- Your content here -->
  </main>

  <footer>
    <p>&copy; 2026 HomeDing</p>
  </footer>
</body>
```

### Available CSS Classes

| Class         | Purpose                                |
| ------------- | -------------------------------------- |
| `.sitelayout` | Activates the full page layout system  |
| `.fillscreen` | Makes layout fill full viewport height |
| `.navbar`     | Horizontal navigation bar              |
| `.sidebar`    | Vertical sidebar (left or right)       |
| `.menu`       | Flyout menu that slides in/out         |

### Responsive Breakpoints

```css
/* Mobile (width < 42em / ~672px) */
/* Stacked layout: header, navbar, main, sidebar vertical */

/* Tablet (42em ≤ width < 56em) */
/* Side-by-side: main + sidebar, menu as flyout */

/* Desktop (width ≥ 56em) */
/* Full layout: menu + main + sidebar all visible */
```

---

## 5. Card Layout System

Cards are the primary UI component for IoT dashboards.

### Basic Card Structure

```html
<div class="card-container col365">
  <!-- Standard card (280px wide) -->
  <div class="card">
    <div class="header">
      <svg><use href="/icons.svg#device" /></svg>
      <h3>Device Name</h3>
      <h4>Subtitle or Status</h4>
    </div>

    <div class="main">
      <!-- Card content: text, controls, values -->
      <p>Current status or data</p>
    </div>

    <div class="footer form-actions">
      <button>Action</button>
      <button>Another</button>
    </div>
  </div>

  <!-- Small card (half-width, 140px) -->
  <div class="card small">
    <div class="main">
      <h3>Compact Card</h3>
      <p>Fits in space-constrained layouts</p>
    </div>
  </div>
</div>
```

### Card Classes and States

| Class                        | Effect                     |
| ---------------------------- | -------------------------- |
| `.card`                      | Default full-width card    |
| `.card.small`                | Half-width compact card    |
| `.card.active`               | Highlighted/selected state |
| `.card-container`            | Grid container for cards   |
| `.card-container.col365`     | 365px column layout        |
| `.card-container.horizontal` | Horizontal card layout     |

### Card Structure Elements

```html
<div class="card">
  <!-- Header: Icon, title, subtitle -->
  <div class="header">
    <svg><!-- icon --></svg>
    <h3>Title</h3>
    <h4>Subtitle</h4>
  </div>

  <!-- Main: Primary content area -->
  <div class="main">
    <!-- Forms, values, charts, etc. -->
  </div>

  <!-- Footer: Action buttons -->
  <div class="footer form-actions">
    <button>Action</button>
  </div>
</div>
```

### Active Card Styling

```scss
.card {
  &.active {
    .header {
      background-color: var(--card-head-active);
    }

    .border {
      border-color: var(--card-border-active);
    }

    img,
    svg {
      background-color: limegreen;
    }
  }
}
```

---

## 6. Common UI Components

### Buttons

```html
<!-- Text button -->
<button>Click Me</button>

<!-- Icon button only -->
<button class="icon">
  <svg><use href="/icons.svg#config" /></svg>
</button>

<!-- Icon + text button -->
<button>
  <svg><use href="/icons.svg#config" /></svg>
  Configure
</button>

<!-- Disabled button -->
<button disabled>Disabled</button>

<!-- Button group (radio/toggle group) -->
<div class="btn-group">
  <button>Option 1</button>
  <button>Option 2</button>
  <button>Option 3</button>
</div>
```

### Forms

```html
<div class="form-grid">
  <!-- Text input -->
  <label>Name:</label>
  <input type="text" placeholder="Enter name" />

  <!-- Select dropdown -->
  <label>Choose:</label>
  <select>
    <option>Option 1</option>
    <option>Option 2</option>
  </select>

  <!-- Radio buttons -->
  <label>Mode:</label>
  <div class="form-inline">
    <label><input type="radio" name="mode" value="auto" /> Auto</label>
    <label><input type="radio" name="mode" value="manual" /> Manual</label>
  </div>

  <!-- Checkbox -->
  <label><input type="checkbox" /> Enable feature</label>
</div>
```

### Input Controls with Icons

```html
<!-- Volume/brightness control -->
<div u-is="input">
  <svg class="down icon"><use href="/icons.svg#minus" /></svg>
  <input type="range" min="0" max="100" />
  <svg class="up icon"><use href="/icons.svg#plus" /></svg>
</div>

<!-- Toggle/switch control -->
<div u-is="input" u-active="power">
  <span class="down">Off</span>
  <input class="switch" type="range" min="0" max="1" />
  <span class="up">On</span>
</div>

<!-- Color hue slider -->
<input type="range" class="band hue" />
```

### Boolean Indicators

```html
<!-- Visual indicator for on/off state -->
<span class="u-bool ux-value border" value="1" u-active="value"></span>
```

---

## 7. Customizing CSS

### Method 1: Override Variables (Recommended)

```html
<body
  class="sitelayout"
  style="
  --card-width: 320px;
  --card-height: 400px;
  --card-gap: 20px;
  --layout-gap: 2em;
"
>
  <!-- Cards will use custom dimensions -->
</body>
```

### Method 2: Page-Specific Styles

```html
<head>
  <link rel="stylesheet" href="/iotstyle.css" />
  <style>
    /* Override styles for this page only */
    .card {
      border-radius: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .navbar {
      background-color: #2c3e50;
      padding: 1em;
    }
  </style>
</head>
```

### Method 3: Modify SCSS Source

For project-wide changes, edit `/css/` files:

```scss
// css/iot.scss
:root {
  --card-width: 300px; // Increase default card width
  --card-gap: 20px; // Increase spacing between cards
  --card-icon-size: 3em; // Larger icons
}
```

Then rebuild: `npm run build:css`

---

## 8. Dark Mode Support

The CSS automatically adapts to the system theme using `light-dark()`:

```scss
// In base.scss
--back: light-dark(
  hsl(220 2% 85%),
  /* Light mode background */ hsl(220 2% 15%) /* Dark mode background */
);

--color: light-dark(
  hsl(220 0 10%),
  /* Light mode text */ hsl(220 0 90%) /* Dark mode text */
);
```

**How it works:**

* CSS automatically uses the user's OS theme preference (light/dark)
* No JavaScript needed
* Respects system settings and `prefers-color-scheme` media query

---

## 9. Color Customization

### Using Hue-based System

All semantic colors use HSL with configurable hue:

```scss
// base.scss
$u-hue: 220deg; // Primary hue (signature blue)

$u-primary: hsl($u-hue 80% 30%); // Active/primary color
$u-primary-text: white;
```

To change the entire color scheme, modify `$u-hue`:

```scss
$u-hue: 120deg; // Green-based theme
$u-hue: 30deg; // Orange-based theme
$u-hue: 0deg; // Red-based theme
```

### Status Color Palette

```css
--success-hue: 80deg; /* Green for success/online */
--warning-hue: 40deg; /* Yellow for warnings */
--error-hue: 0deg; /* Red for errors/offline */
```

Use these in your UI:

```html
<div style="color: var(--success-line)">Online</div>
<div style="color: var(--warning-line)">Warning</div>
<div style="color: var(--error-line)">Error</div>
```

---

## 10. Responsive Design

### Mobile-First Approach

The layout automatically adapts:

```css
/* Default: Mobile stacked layout */
body {
  flex-direction: column;
}

/* Tablet: 42em - 56em width */
@media (width >= 42em) {
  /* Sidebar appears beside main */
  body {
    flex-direction: row;
  }
}

/* Desktop: 56em+ width */
@media (width >= 56em) {
  /* Full layout with menu visible */
}
```

### Container Queries for Cards

```scss
.card-container {
  @container (width < 600px) {
    // Cards stack or shrink on narrow screens
    --card-width: 100%;
  }
}
```

---

## 11. Practical Examples

### Example 1: Simple Device Dashboard

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Living Room Dashboard</title>
    <link rel="stylesheet" href="/iotstyle.css" />
    <script src="/micro.js"></script>
  </head>
  <body class="sitelayout">
    <header>
      <h1>🏠 Living Room</h1>
    </header>

    <main>
      <div class="card-container col365">
        <!-- Light Control Card -->
        <div class="card" u-control="light" microID="light/mainled">
          <div class="header">
            <svg><use href="/icons.svg#bulb" /></svg>
            <h3 u-text="title">Main Light</h3>
          </div>
          <div class="main">
            <div u-is="input" u-active="value">
              <span class="down">Off</span>
              <input class="switch" type="range" u-value="brightness" />
              <span class="up">On</span>
            </div>
          </div>
        </div>

        <!-- Temperature Card -->
        <div class="card" u-control="sensor" microID="device/0/dht">
          <div class="header">
            <svg><use href="/icons.svg#dht" /></svg>
            <h3>Environment</h3>
          </div>
          <div class="main">
            <p>Temperature: <strong u-text="temperature">--</strong>°C</p>
            <p>Humidity: <strong u-text="humidity">--</strong>%</p>
          </div>
        </div>
      </div>
    </main>
  </body>
</html>
```

### Example 2: Documentation Page

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Setup Guide</title>
    <link rel="stylesheet" href="/docstyle.css" />
  </head>
  <body class="sitelayout">
    <header>
      <h1>Getting Started</h1>
    </header>

    <nav class="sidebar">
      <li><a href="#installation">Installation</a></li>
      <li><a href="#config">Configuration</a></li>
      <li><a href="#troubleshooting">Troubleshooting</a></li>
    </nav>

    <main>
      <h2 id="installation">Installation</h2>
      <p>Follow these steps...</p>

      <blockquote>
        <strong>Note:</strong> Make sure you have version 2.0 or later.
      </blockquote>

      <pre><code>npm install homedinging
node setup.js</code></pre>

      <h2 id="config">Configuration</h2>
      <!-- More content -->
    </main>
  </body>
</html>
```

### Example 3: Custom Card Styling

```html
<head>
  <link rel="stylesheet" href="/iotstyle.css" />
  <style>
    /* Custom card grid for this page */
    .card-container.custom {
      --card-width: 360px;
      --card-height: 450px;
      --card-gap: 24px;
    }

    /* Larger icons */
    .card .header svg {
      width: 3em;
      height: 3em;
    }

    /* Colored headers */
    .card.success .header {
      background-color: var(--success-back);
      color: var(--success-line);
    }

    .card.warning .header {
      background-color: var(--warning-back);
      color: var(--warning-line);
    }
  </style>
</head>
<body class="sitelayout">
  <main>
    <div class="card-container custom">
      <div class="card success">
        <div class="header"><h3>✓ Online</h3></div>
        <div class="main"><p>All systems operational</p></div>
      </div>

      <div class="card warning">
        <div class="header"><h3>⚠ Caution</h3></div>
        <div class="main"><p>Battery low on device-3</p></div>
      </div>
    </div>
  </main>
</body>
```

---

## 12. Testing and Verification

### View Test Pages

Start the dev server and visit:

```bash
npm run dev
```

Then open in your browser:

* `http://localhost:3123/test/test-style.htm` — Color palette, cards, buttons, forms
* `http://localhost:3123/test/test-cards.htm` — Card layout variations
* `http://localhost:3123/test/test-docstyle.htm` — Documentation styling
* `http://localhost:3123/board.htm` — Live board with widget binding

### Lint SCSS

```bash
npm run test:css
```

---

## 13. Advanced: Modifying SCSS

### File: `css/base.scss`

Change the primary hue and theme colors:

```scss
$u-hue: 220deg; // Main color hue
$u-primary: hsl($u-hue 80% 30%);
$u-secondary: #aaaaaa;
$u-border-color: #555555;
```

### File: `css/card.scss`

Adjust card dimensions:

```scss
$u-card-width: 280px;
$u-card-gap: 16px;

:root {
  --card-height: 320px;
  --card-radius: 1em;
}
```

### File: `css/page.scss`

Modify layout dimensions:

```scss
$u-menu-width: 14em;
$u-main-width: 42em;
$u-sidebar-width: 14em;
```

After changes, rebuild:

```bash
npm run build:css
```

---

## 14. Browser Support

* **Modern browsers** (Chrome, Firefox, Safari, Edge) — Full support
* **CSS Variables** — Supported in all modern browsers
* **Dark mode (`light-dark()`)** — Requires modern browser (2023+)
* **CSS Grid/Flexbox** — Full support
* **SVG icons** — Supported with `<use>` elements

---

## Quick Reference

| Task              | Command                       |
| ----------------- | ----------------------------- |
| Build CSS         | `npm run build:css`           |
| Watch CSS changes | `npm run build:css-watch`     |
| Lint SCSS         | `npm run test:css`            |
| Start dev server  | `npm run dev`                 |
| Test pages        | `http://localhost:3123/test/` |

---

## Resources

* **CSS Files:** `/css/*.scss`
* **Test Pages:** `/test/test-*.htm`
* **Example Boards:** `/board.htm`, `/portal.htm`
* **Main Stylesheet:** `iotstyle.css`, `docstyle.css`
* **Variables Reference:** `css/base.scss` (lines 1-80)
* **Card System:** `css/card.scss`
* **IoT Components:** `css/iot.scss`

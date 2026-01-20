# Copilot Instructions — HomeDing WebFiles

**Purpose:** Orient AI coding agents to be immediately productive in this monorepo containing embedded device UI, portal server, and SFC component system.

## Big Picture Architecture

This is a **hybrid monorepo**: 
- **Client-side UI** (`/src`, `/sfc`) — compiled into `micro.js` and deployed to embedded HomeDing devices or Node.js portal
- **Portal Server** (`/server`) — Express-based Node.js server for discovering and managing local HomeDing devices
- **SFC Subsystem** (`/sfc` subproject) — tiny Single File Component runtime (Web Components) used by portal and devices
- **Assets** (`/css`, `/case`) — SCSS stylesheets and device simulation configs (e.g., `case-display/`, `case-rf/`)

### Key Data Flow
1. **Device Discovery** → `server/Discover.ts` uses mDNS to locate HomeDing devices on the network  
2. **Config Proxy** → `server/ProxyElement.ts` and `server/MockElements.ts` map real device configs to UI
3. **Client Rendering** → `src/micro.ts` (Widget registry) + `src/microHub.ts` (data pub/sub) render dynamic UIs from configs
4. **SFC Components** → Portal uses `/sfc/*.sfc` files (Web Components) for reusable UI pieces

## When to Look First

| Need | File(s) |
|------|---------|
| Understand widget system | `src/GenericWidget.ts`, `src/micro.ts` |
| Portal server architecture | `server/HomeDingServer.ts`, `app.js` |
| Data publish/subscribe | `src/microHub.ts` |
| Device discovery | `server/Discover.ts` |
| SFC (Web Components) | `sfc/.github/copilot-instructions.md` (separate subsystem) |
| Build pipeline | `package.json` (scripts section) |

## Build & Dev Workflow (Explicit Commands)

```bash
# Full build: TypeScript + SCSS + Server
npm run build

# Development (live reload SCSS + TS, auto-restart server)
npm run dev

# Start server only (requires pre-built dist)
npm start

# Individual builds
npm run build:ts          # Compile src/*.ts → micro.js
npm run build:ts-mini    # Compile src/*.ts → micro-mini.js (smaller bundle)
npm run build:server     # Compile server/*.ts → dist-server/
npm run build:css        # Compile *.scss → *.css

# Testing
npm run test:ts          # ESLint on src/
npm run test:server      # ESLint on server/
npm run test:css         # stylelint on css/

# Packing (create distributable artifacts)
npm run pack:dist        # Pack for standard devices (1 MB limit)
npm run pack:minimal     # Pack for minimal devices (128 KB limit)
npm run pack:embed       # Create .h include file for sketches
npm run pack:icons       # Generate icons.svg from icon sources
```

**Key:** `npm run dev` combines all watchers in parallel for rapid iteration; `npm start` is for production simulation.

## Project Structure

```
├── src/                      # Client-side TypeScript → micro.js
│   ├── micro.ts              # Widget registry & lifecycle
│   ├── microHub.ts           # Data hub (pub/sub)
│   ├── GenericWidget.ts      # Base widget class
│   ├── *Widget.ts            # Specialized widgets (ButtonWidget, TimerWidget, etc.)
│   └── utils.ts              # Shared utilities
├── server/                   # Node.js Portal server
│   ├── HomeDingServer.ts     # Main Express app + routing
│   ├── Discover.ts           # mDNS device discovery
│   ├── ProxyElement.ts       # Forward real device requests
│   ├── MockElements.ts       # Simulated device elements
│   ├── EventBus.ts           # Server event aggregation
│   └── Registry.ts           # Element registry (metadata)
├── sfc/                      # Single File Component system (Web Components)
│   ├── loader.ts             # SFC parser & UComponent lifecycle
│   ├── data-hub.ts           # Client-side data persistence
│   └── *.sfc                 # Component definitions
├── css/                      # SCSS stylesheets
│   ├── base.scss             # Core theming variables
│   ├── card.scss             # Card layout & components
│   └── iot.scss              # Specific IoT UI patterns
├── case/                     # Device simulation folders
│   ├── switch/, radio/, etc. # Config files per device type
├── test/                     # Test/demo HTML files
└── dist/, dist-mini/         # Build artifacts (packed for deployment)
```

## Core Conventions & Patterns

### 1. Widget System (Client-Side Binding)
- **All interactive UI elements** extend `GenericWidgetClass` (decorator: `@MicroControl('name')`).
- Widgets bind to HTML **attributes** (e.g., `u-text`, `u-value`, `u-active`, `u-action`) for declarative data binding.
- Data changes propagate via **hub.subscribe()** (example: `hub.subscribe('device/light/led?*', handler)`).
- Example from `src/GenericWidget.ts`: `u-text="key"` substitutes element text; `u-value="key"` updates input field value.

### 2. Hub (Data Pub/Sub)
- `window.hub` is a global singleton (see `src/microHub.ts`).
- Paths use `/` as delimiter (e.g., `device/0/light/led/value`).
- **Subscribe patterns:** `device/0/light/*/value` (wildcard single segment), `device/**/value` (recursive).
- Used to sync device state → UI and vice versa.

### 3. Server Routes (Portal)
- **Express Router** defined in `server/HomeDingServer.ts`.
- Routes map to device APIs: `/api/device/:id/...` proxies to real device or MockElements.
- **Config proxying:** requests to `/config` or `/env.json` route to `ProxyElement.ts` for real devices or `MockElements.ts` for simulation.

### 4. CSS Architecture (SCSS Modules)
- **Variable-driven design:** see `css/base.scss` for color scheme, spacing, typography.
- Compiled to `iotstyle.css` (full site) and `docstyle.css` (docs).
- Two distributions: `dist/` (all styles ~50 KB) and `dist-mini/` (stripped-down ~10 KB).

### 5. SFC (Single File Components) — Separate System
- Web Components loaded dynamically; see `sfc/` subproject for details.
- Used by portal for reusable UI widgets (e.g., `u-toast.sfc`, `u-form-*.sfc`).
- **Important:** SFC subsystem has its own `copilot-instructions.md` — refer to it for modifications.

## When Modifying Key Areas

### Adding a New Widget Type
1. Create `src/NewWidget.ts` extending `GenericWidgetClass`.
2. Use `@MicroControl('new-name')` decorator.
3. Implement `connectedCallback()` and `newData()` methods.
4. Rebuild: `npm run build:ts`.

### Adding Portal Server Routes
1. Edit `server/HomeDingServer.ts` — add route to `this._api`.
2. For device discovery, use `this._deviceRegistry` or `this._discovery`.
3. Rebuild: `npm run build:server`.

### Device Simulation (Testing Without Hardware)
1. Add config to `case/{device-type}/config.json` and `env.json`.
2. Update `server/MockElements.ts` to implement matching element behaviors.
3. Start portal with simulation: `npm start -- --case case-display`.

## Critical Files (Don't Break)

- **`src/micro.ts`** — Widget registry initialization; breaking this breaks all UI binding.
- **`src/microHub.ts`** — Data hub API (`publish`, `subscribe`, `get`); many components depend on exact behavior.
- **`server/HomeDingServer.ts`** — Express app setup; affects all portal routing.
- **`css/base.scss`** — Root CSS variables; used by all device UIs.

## Testing Before Merge

```bash
# Full validation (mimics CI)
npm run test

# Quick iteration during development
npm run build:ts && npm run test:ts   # TypeScript syntax + lint
npm run build:server && npm run test:server  # Server lint
npm run build:css && npm run test:css        # SCSS lint
```

## Agent-Specific Guidelines

1. **Preserve public APIs:** `window.hub` and `window.sfc` (from `/sfc/` subproject) are used by external configs and device code; breaking changes require version bump.
2. **Bundle size matters:** Device distributions must fit constraints (`dist` ≤ 1 MB, `dist-mini` ≤ 128 KB). Use `npm run pack:*` to check footprints.
3. **Minimal style assumptions:** Device UIs are deployed widely; CSS changes may break devices in field. Test across browsers and sizes.
4. **mDNS discovery is optional:** Portal works with or without device discovery; keep `server/Discover.ts` changes backward compatible.

---

**If unclear:** Check `README.md` for project goals, or ask about specific widget behaviors in `src/` or server routing in `server/`.

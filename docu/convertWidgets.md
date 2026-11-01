# Re-implementing Widgets as SFC Components

When moving a widget from `/src/*Widget.ts` to `/hdw/*.sfc`, preserve its behavior and rendered UI while moving component-specific layout and behavior into the SFC.

## Migration checklist

1. **Understand the existing behavior.** Trace the widget lifecycle, hub subscriptions and replay, data bindings, actions, and any coordination between instances. Inspect the page templates and the case configuration that exercises it. Preserve the existing user-visible HTML and interaction unless a redesign is explicitly intended.

2. **Move the layout into the SFC.** Put the widget's inner markup in its `<template>` (often `<template light>` for existing board styles). Pages should provide only a host element in `#u-templates`, for example:

   ```html
   <hdw-scenes class="card" u-control="scene" microID="${id}"></hdw-scenes>
   ```

   Do not hardcode creation of the custom element in a page script. Let the existing `micro.insertTemplate()` flow find and clone the `[u-control]` template.

3. **Keep special behavior inside the component.** If several widget instances contribute to one visible card, retain that aggregation in the SFC: identify the first live instance as the shared card, hide later instances, and route each instance's data to its corresponding UI. Ignore template instances when selecting the live shared instance; elements under `#u-templates` are not rendered controls.

4. **Use the correct data hub and lifecycle.** The existing widgets use `window.hub` from `microHub`, with slash-separated paths, key/value callbacks, and `subscribe`/`replay`. The SFC runtime's `window.datahub` is a different API and is not a replacement. Initialize subscriptions only when the component is live and its template DOM is ready; subscribe before replaying so current state and future updates are both handled. Keep SFC event-handler names lowercase, such as `onclick`.

Migration to the sfc based data hub will come in a later change and should not be reflected as of now.
TODO: remove this annotation when the data hub migration is done.

5. **Preserve actions and errors.** Keep the existing action URL, encoding, and state-refresh behavior. Check fetch responses and report failures rather than silently treating a failed request as success.

6. **Update all integration points.** Add the SFC to the page's `window.loadComponent()` list (or direct component loading), add its host template to every page that uses it, include it in the HDW bundle command in `package.json`, and remove the old widget registration/import from both `src/micro.ts` and `src/micro-mini.ts` once no legacy page depends on it. Ensure deployment serves the component file or generated bundle.

## Verification

- Run the TypeScript typecheck and lint after removing the old widget.
- Pack the HDW SFC bundle to validate the component.
- Run the relevant Node.js case server and test the actual case `env.json`/`config.json`.
- Check initial hub replay, live data updates, multiple instances, one visible aggregated card, no-data behavior, and the action request/response.

For scene elements, the simulator can be started with `node app.js -m=false -d -c=scene` using the configuration from the /case/scene folder.
After migrating find a test case with the migrated widget or create a new one when none was found.

## Log widget notes

`LogWidget` renders the configured log card and loads the current log file plus its optional `_old.txt` archive. Keep the chart and its header inside `hdw-log.sfc`; the board only needs an `hdw-log` host in `#u-templates`. Load the SFC after `hdw-generic` and ensure `u-linechart` is available from the shared SFC bundle. Initialize chart defaults before replaying the legacy hub so the first `filename` update can draw immediately. Preserve the current/old file ordering, CSV row filtering, chart options, and refresh behavior; report failures when the current file cannot be loaded.

Test against `/case/air` using `node app.js -m=false -d -c=air` to exercise configured log cards and real data files.

## Button widget notes

`ButtonWidget` supports both `button` (labelled from `title`) and `webbutton` (labelled from `description`). Preserve its shared `.btnPanel` grouping and distinguish the label key through a host attribute. Keep short-click dispatch delayed by 250 ms so a following double-click can cancel it; dispatch `doubleclick` for double-clicks and `press` for pointer presses longer than 800 ms. Test all three actions using the `/case/radio` configuration.

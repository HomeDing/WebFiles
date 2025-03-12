# SFC

## SFC Bundles

This loader supports to load multiple sfc components from a single combined file.

In this mode a series of `<sfc>` tags is used to bundle the `<script>`, `<template>` and `<style>` information for each defined
component for creating or extending html elements:

``` html
<sfc tag="u-color">
  <style...>
  <script...>
  <template...>
</sfc>

<sfc tag="u-time">
  <script extends="time" ...>
  <style...>
  <template...>
</sfc>

<sfc tag="u-time">
  <script extends="time" ...>
  <style...>
  <template...>
</sfc>
```

* The `<sfc>` is wrapping the definition of a SFC and a unique `tag` name must be specified.
* The `<script>` part is mandatory and must include the class definition for the component or component-extension.
  When the component extends a regular HTML tag the `extends` attribute must specify the HTML tag name.
* The `<template>` part is optional and is only used for defining new user-defined components.
* The `<style>` is mandatory and the attribute `scoped` is only used for defining new user-defined components.

--- 

This release of the loader adds the capability to combine and load multiple sfc components from a single combined file. This reduces load
on networking and reduces the number of files to be deployed.



The name of the `<sfc>` file is used as the name for the tag to be registered in the customElements registry when components with
one definition.  
When using multiple definitions in a single combined file the tag-name must be added as an attribute on the sfc tag and the
filename has no meaning.

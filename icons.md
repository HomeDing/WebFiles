# Icons for Devices

There are many icons available that can be used for Elements or devices as a whole. They are available in the svg format 
to that has the smallest download footprint for icons and can be used by all current browsers.

To support icons for hyperlinks that can be saved in favorites or on mobile device homepages some other specific formats
are required.

To create the set of icons you need the tool https://www.pwabuilder.com/imageGenerator is helpful by uploading the corresponding svg file
and the renaming the following icons accordingly:

| filename        | OS      | resolution          | used for...                |
| --------------- | ------: | ------------------- | -------------------------- |
| favicon.ico     | all     | 16x16, 32x32, 64x64 | for hyperlinks in general  |
| favicon144.png  | windows | 144x144             | window tiles               |
| favicon180.png  | apple   | 180x180             | touch icon                 |
| favicon192.ico  | android | 192x192             | tiles on android homepages |
| favicon270.png  | windows | 270x270             | medium window tiles        |
| favicon512.ico  | android | 512x512             | tiles on android homepages |

For the icons of the HomeDing library you can find zip files for every icon in the repository that all contain the following files:

They are linked direct or indirect to the index.htm file

### In the html-header

```html
  <link rel="apple-touch-icon" sizes="180x180" href="/favicon180.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon192.png">
  <meta name="msapplication-config" content="/browserconfig.xml" />
  <meta name="msapplication-TileColor" content="#2b5797">
  <meta name="msapplication-TileImage" content="/favicon144.png">
  <meta name="theme-color" content="#ffffff">
  <link rel="manifest" href="/site.webmanifest">
```

### In the manifest file

```json
{
  "name": "HomeDing based device",
  "short_name": "Ding",
  "icons": [
    { "src": "/favicon192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/favicon512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

### In browserconfig

```xml
<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/favicon270.png"/>
      <TileColor>#2b5797</TileColor>
    </tile>
  </msapplication>
</browserconfig>

```



## See also

If you like to create your own icon files you can find much information about this on the following web sites:

* <https://www.w3.org/TR/appmanifest/>
* <https://realfavicongenerator.net/>
* <https://iconifier.net/>
* <https://www.ionos.de/tools/favicon-generator>
* <https://developer.chrome.com/extensions/manifest>
* <https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/gg491740(v=vs.85)>


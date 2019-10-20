# HomeDing WebFiles

This is the central project for developing the small web UI for HomeDing devices.

![Build Status](https://dev.azure.com/HomeDing/WebFiles/_apis/build/status/HomeDing.WebFiles?branchName=master)


# uploading an initial web (Bootstrap helper)

boot.htm
boot.js


# uploading an initial web 

The HomeDing device has an embedded web server that offers a simple upload functionality that is built-in the sketch.

You can reach it on a un-configured device using the url http://ESP_xxxxxx/$upload.
The real server name or the ip-address of an un-configured device can be found in the serial output.

http://ESP_2987B5/$upload
http://192.168.2.170/$upload

The minimal set of files that need to be uploaded are:

* ding-ide.htm
* iotstyle.css
* micro.js
* ding.js
* ding-ide.js

Some icons will be missing now but the configuration IDE is fully operational and can be started using http://192.168.2.170/ding-ide.htm.

## Uploading / Updating the files 


In the WebFiles project you can find 

## create the system configuration

The system configuration needs to be create in the env.json file. I recommend using an editor, enter the content from below and adjust the device name and the drop it to the server.

You can also create a new env.json file using the ide.

```JSON
{
  "device": {
    "0": {
      "name": "nodeding"
    }
  },
  "ota": {
    "0": {
      "passwd": "123"
    }
  },
  "ssdp": {
    "0": {
      "ModelUrl": "https://www.mathertel.de/Arduino"
    }
  }
}
```


http://192.168.2.170/$list






### Create a minified version of boot.htm

2 steps are required to create a minified version of bootpage.htm:

1. remove all whitespaces from the html part of the file.
2. pass the javascript through the minify or uglify service like https://www.uglifyjs.net/
3. be sure to replace all double-quotes by single-quotes.
4. add result into "bootpage.h" replacing the existing text.


Promise Implementation for IE:
 https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE

<!-- 
More to read:

https://www.w3.org/TR/appmanifest/
http://tinkerman.cat/optimizing-files-for-spiffs-with-gulp/ -->


## New Element Dialog

using the [+] Add new element command you can add a new element to the configuration.

**Step 1: Add a new Element...**

![Picture](newdlg01.png)

You need to select the right type of element and enter the new id for the element.

Continue by clicking the `next` button.

**Step 2: Setup Properties**

![Picture](newdlg02.png)

This steps shows you the list or properties you need to specify for the given element type.

To keep implementation slim no check of the entry is made. Empty properties will not be written to config.

Save the settings by clicking the `save` button.


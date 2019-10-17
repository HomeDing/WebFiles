# HomeDing WebFiles

![Build Status](https://dev.azure.com/HomeDing/WebFiles/_apis/build/status/HomeDing.WebFiles?branchName=master)

This is the project of the HomeDing library for developing the Web UI to be embedded into the HomeDing devices.
It supports TypeScript and SCSS compilation. 

This project also contains an emulator of devices implemented in nodejs. 

To use the project a node.js installation version 8.x or later is required.

* clone the repository to a local folder
* install node.js version 8.x or later
* run `npm install` to load the dependencies

## Building the web for embedding into devices

There are typescript and SASS source files used that need to be compiled using the npm tasks.

```PS
makeDist.ps1
```

This powershell script will compile and copy all required files to the `dist` folder.

## Starting the web server

The following steps can be used to start the web server with the emulator locally:

### Typescript compilation

To build the javascript file of the micro framework use the following npm task:

```ps
npm run build:ts
```

### SCSS compilation

To build the CSS file of the micro framework use the following npm task:

```ps
npm run build:css
```

This will generate the files `iotstyle.css` and `micro.js` that are used in the full version.


### Start the server

```sh
node server.js 
```  

## See also:

* Promise implementation for IE11: <https://github.com/stefanpenner/es6-promise>

* Use the HomeDing library on a new device: <https://homeding.github.io/#page=stepsnewdevice.md>
* New upload or upgrade the web on a device: <https://homeding.github.io/#page=stepsupdateweb.md>

  
<!-- --- 

### Create a minified version of boot.htm

2 steps are required to create a minified version of bootpage.htm:

1. remove all whitespaces from the html part of the file.
2. pass the javascript through the minify or uglify service like https://www.uglifyjs.net/
3. be sure to replace all double-quotes by single-quotes.
4. add result into "bootpage.h" replacing the existing text. -->

<!-- 
More to read:

https://www.w3.org/TR/appmanifest/
http://tinkerman.cat/optimizing-files-for-spiffs-with-gulp/ -->

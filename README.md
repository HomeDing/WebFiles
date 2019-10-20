# HomeDing WebFiles

![Build Status](https://dev.azure.com/HomeDing/WebFiles/_apis/build/status/HomeDing.WebFiles?branchName=master)

This is the project of the HomeDing library for developing the Web UI to be embedded into the HomeDing devices.
It supports TypeScript and SCSS compilation. 

This project also contains an emulator of devices implemented in nodejs. 

To use the project a node.js installation version 8.x or later is required.

* clone the repository to a local folder
* install node.js version 8.x or later
* run `npm install` to load the dependencies


## Device Simulation Server

The server for the simultion web site uses express web server as a foundation and it can be customized by some commandline options.
The simulated type of device is defined by the config and status files in the corresponding sub folder like `case-ntp`.
To start this configution use the `--case` option like:
```txt
> node server.js --case ntp
HomeDing Web Emulator
Starting case case-ntp/...
open http://localhost:3123/
```

To get a short description of the available options use:
```txt
> node server.js --help
HomeDing Web Emulator
Usage: server.js -c <case name>
  This web server hosts a full version of the HomeDing Web interface
  and emulates to a certain degree the services provided by a HomeDIng device.

Options:
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
  -c, --case     Name of the simulated case          [string] [default: "radio"]
  -v, --verbose  Verbose logging                      [boolean] [default: false]
```

## Building the web for embedding into devices

The build steps are using npm scripts to compile the typescript and SASS source files.

- **build:css:** compile iotstyle.scss to iotstyle.css
- **build:css-min:** compile iotstyle.scss to mindist/iotstyle.css with compressing
- **build:css-watch:** compile iotstyle.scss to iotstyle.css and watch for changes
- **build:ts:** compile the typescript files to micro.js
- **build:ts-watch:** compile the typescript files to micro.js and watch for changes
- **build:** compile typescript and SCSS

The **build** script is required to start the server in emulating mode and is required before packacking  

```PS
npm run build
```

## Packing the files for upload into devices

The pack steps will create the format required to be used in the devices.

- **pack:dist:** create a `dist` folder with all files required for upload 
- **pack:embed:** create the `upload.h` file with the embedded pages for setup 
- **pack:** create both.

```PS
npm run pack
```


### Start the server

```sh
node server.js 
```  

## See also:

* Promise implementation for IE11: <https://github.com/stefanpenner/es6-promise>

* Use the HomeDing library on a new device: <https://homeding.github.io/#page=stepsnewdevice.md>
* New upload or upgrade the web on a device: <https://homeding.github.io/#page=stepsupdateweb.md>


## Plugins

The server and the build tasks are using the following packages:

- **express:** web server 
- **debug:** logging output
- **multer:** express middleware for uploading files 
- **yargs:** command line for starting the server
- **typescript:** compile typescript to javascript
- **html-minifier :** reduce html file size
- **node-sass :** compile SCSS to CSS
- **uglify-js:** minify javascript files
- **shell:** shell operations of files and folders 


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

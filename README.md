# HomeDing WebFiles

Build Status: [![Build Status](https://dev.azure.com/HomeDing/WebFiles/_apis/build/status/HomeDing.WebFiles?branchName=master)](https://dev.azure.com/HomeDing/WebFiles/_build)

This is the project of the HomeDing library related to web technologies. It i used for multiple purposes:

* The Web UI to be embedded into the HomeDing devices is developed using TypeScript and SCSS compilation and packaging.
  The result is a set of static files that can be uploaded to devices.

* There is a device simulator integrated that allows to use mock files and some mock service implementations that helps
  developing and testing without the need for flashing physical devices. 

* The Portal implementation is as central solution that identifies all HomeDing devices in the local network and offers an easy navigation to the device specific pages.

This project relies on the nodejs runtime and several libraries. See installation.

## Overview

The project is not producing a npm library but a distributable solution in 2 variations. Therefore packing and publishing is not used as usual for libraries.


npm tasks in use:

```
install ---> build ------------+---> start 
              |                |
              +-> build:ts     +--> pack
              +-> build:css          +-> pack:dist
                                     +-> pack:minimal
                                     +-> pack:embed


```

## Installation

To use the project a node.js installation version 12.x or later is required.

* clone the repository to a local folder
* install node.js version 12.x or later
* run `npm install` to load the dependencies (libraries)


## Building

The `npm run build` will trigger compiling the typescript files and the SASS files into javascript and CSS.
The resulting files are not uglified or packed to enable easily debugging.

This is a pre-requisite to start the local server that simulates a device and mocks data. `npm start` will do a `npm run build` before actually starting the server.

- **build:css:** compile iotstyle.scss to iotstyle.css
- **build:css-watch:** compile iotstyle.scss to iotstyle.css and watch for changes
- **build:ts:** compile the typescript files to micro.js
- **build:ts-watch:** compile the typescript files to micro.js and watch for changes
- **build:** compile typescript and SCSS


## Starting the server 

The server for the simulation web site uses express web server as a foundation and it can be customized by some command line options.

The simulated type of device is defined by the config and status files in the corresponding sub folder like `case-ntp`.

The `npm start` will start the server after building the javascript and CSS files.

To start a specific test case you can add parameters like:

    npm start -- -c air

to start the `air` test case defined in the `case-air` folder.

The open the default page using <http://localhost:3123/> for device simulation.

The start the portal implementation use <http://localhost:3123/portal.htm>.


## Packing the files for upload into devices

The pack steps will create the format required to be used in the devices.

- **pack:dist:** create a `dist` folder with all files required for upload 
- **pack:minimal:** create a `dist-mini` folder with all files required for upload to minimal devices. 
- **pack:embed:** create the `upload.h` file with the embedded pages for setup 
- **pack:** create all above.


## Create the builtin web UI

To create the builtin web ui that will be compiled into the firmware the `upload.h` file can be created
by using the script `packembedweb.js`.

This can be started using the npm command

```CMD
npm run pack:embed
```

The generated `upload.h` file needs to be copied to the Arduino library folder.

The source files used are:
* makeembedtemplate.txt
* setup.htm
* upload.htm
* boot.htm


## Plugins used

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


## See also:

* Use the HomeDing library on a new device: <https://homeding.github.io/#page=stepsnewdevice.md>
* New upload or upgrade the web on a device: <https://homeding.github.io/#page=stepsupdateweb.md>


# HomeDing WebFiles

![Build Status](https://github.com/HomeDing/WebFiles/actions/workflows/node.js.yml/badge.svg)

This is the project of the HomeDing library related to web technologies. It is used for multiple purposes:

* The Web UI to be embedded into the HomeDing devices.
* Web UI files to be embedded into the sketch.
* The Portal implementation, a node.js based central solution that can act as a single point to find and operate all HomeDing devices.
* The Portal implementation can also be used to simulate (mock) some Elements for development purpose.


## Folder structure and technologies of this project

The client side components of this project are used for implementing the portal and the WebUI for the devices. They are delivered as static files to the browser.
The project folder structure includes these files directly in the ´root´ and the ´i´ sub-folder.
This allows using the project directly for development:

* The HTML files are created in the root folder.
* The CSS files are generated using SASS from the *.scss file in the root.
* The Javascript for client side scripting is compiled from the `src` folder into the `micro.js` file in the root directory.
* The Javascript for node.js server is compiled from the `server` folder.
* The WebUI that will be deployed on devices are packed into the folders `dist` and `dist-mini`
<!-- * The portal implementation is packed into the folder `dist-portal` -->

All development build tasks are started from npm jobs like `npm run build:ts` and are im

  The Typescript source files that contain the client-side scripting are in the `src` folder. They are compiled into the `micro.js` file in the root directory. 
  The result is a set of static files that can be uploaded to devices.


## Building steps

The steps to build the Web UIs:

* Compile CSS using `npm run build:css`.
* Compile client side script using `npm run build:ts`.
* Option to start a development server using `npm start`
* Pack files for standard devices (1 MByte file space) using `npm run pack:dist`.
* Pack files for minimal devices (128 kByte file space) using `npm run pack:minimal`.
* create the include file for sketch embedded files using `npm run pack:embed`.

The steps to build the server:

* Compile CSS using `npm run build:css`.
* Compile client side script using `npm run build:ts`.
* Compile server side script using `npm run build:server`.
* Option to start a development server using `npm start`


## Building the portal project

There is a device simulator integrated that allows to use mock files and some mock service implementations that helps
developing and testing without the need for flashing physical devices.

The portal server identifies all HomeDing devices by using mDNS and offers an easy navigation to the device specific pages.

It is developed using TypeScript and SCSS compilation and packaging.

This project relies on the nodejs runtime and several libraries. See installation.


## Overview

The project is not producing a npm library but a distributable solution in 2 variations. Therefore packing and publishing is not used as usual for libraries.

npm tasks in use:

``` txt
install ---> build ------------+---> start 
              |                |
              +-> build:ts     +--> pack
              +-> build:css          +-> pack:dist
                                     +-> pack:minimal
                                     +-> pack:embed
```

The **build** steps create derived version of the source files.

The **pack** steps create the target file collections.


## Installation

To use the project a node.js installation version 12.x or later is required.

* clone the repository to a local folder
* install node.js version 12.x or later
* run `npm install` to load the dependencies (libraries)


## Building

The `npm run build` will trigger compiling the typescript files and the SASS files into javascript and CSS.
The resulting files are not uglified or packed to enable easily debugging.

This is a pre-requisite to start the local server that simulates a device and mocks data. `npm start` will do a `npm run build` before actually starting the server.

* **build:css**: compile iotstyle.scss to iotstyle.css
* **build:css-watch**: compile iotstyle.scss to iotstyle.css and watch for changes
* **build:ts**: compile the typescript files to micro.js
* **build:ts-watch**: compile the typescript files to micro.js and watch for changes
* **build**: compile typescript and SCSS


## Starting the server 

The server for the simulation web site uses express web server as a foundation and it can be customized by some command line options.

The simulated type of device is defined by the config and status files in the corresponding sub folder like `case-ntp`.

The `npm start` will start the server after building the javascript and CSS files.

To start a specific test case you can add parameters like:

    npm start -- -c air

to start the `air` test case defined in the `case-air` folder.

The open the default page using <http://localhost:3123/> for device simulation.

The start the portal implementation use <http://localhost:3123/portal.htm>.


## Packing

```CMD
npm run pack
```

This command will create all packages below.


### Packing for standard distributions

The standard pack contains all Web UI files for a full-featured device. This requires a filesystem of min. 1 MByte.

```CMD
npm run pack:dist
```

This command will create a `dist` folder with all files required for upload into the filesystem of a new device.

In this packing job is implemented using a nodejs implementation that you can find in `packdist.js`. It knows the required files and will copy them (no minifying etc) into the `dist` folder.

In addition a list.txt file is formed that will also name all the files that can be updated by the built-in `boot.htm` implementation
that can be started using <http://[devname]/$boot.htm> even on devices that only have a sketch uploaded and still an empty filesystem.


### Packing for minimal distributions

The minimal pack contains all Web UI files for a small device. This requires a filesystem of min. 128 kByte.

```CMD
npm run pack:minimal
```

This command will create a `dist-mini` folder with all files required for upload to minimal devices.


In this packing job is implemented using a nodejs implementation that you can find in `packminimal.js`.
It knows the required files and will transfer them  into the `dist-mini` folder. Some files will be minified (HTML, CSS) or uglified (JS) to save space on the filesystem.

In addition a list.txt file is formed that will also name all the files that can be updated by the built-in `boot.htm` implementation
that can be started using <http://[devname]/$boot.htm> even on devices that only have a sketch uploaded and still an empty filesystem. 

You an specify the download version with a parameter ???


### Create the builtin web UI

To create the builtin web ui that will be compiled into the firmware the `upload.h` file can be created
by using the script `packembedweb.js`.

```CMD
npm run pack:embed
```

This command will create the `upload.h` file with the embedded pages for setup 

The generated `upload.h` file needs to be copied to the Arduino library folder.

The source files used are:

* makeembedtemplate.txt
* setup.htm
* upload.htm
* boot.htm


## Plugins used

The server and the build tasks are using the following packages:

- **express**: web server 
- **debug**: logging output
- **multer**: express middleware for uploading files 
- **yargs**: command line for starting the server
- **typescript**: compile typescript to javascript
- **html-minifier-terser**: reduce html file size
- **sass**: compile SCSS to CSS
- **shell**: shell operations of files and folders 


## See also:

* Use the HomeDing library on a new device: <https://homeding.github.io/#page=stepsnewdevice.md>
* New upload or upgrade the web on a device: <https://homeding.github.io/#page=stepsupdateweb.md>


# Test case "logic"

This test case can be used to simulate a device with the following components:

## env.json setup

* **device/0** - configuration only


## config.json setup

* **switch/in1**" -- switch element to create a boolean value in1.
* **switch/in2**" -- switch element to create a boolean value in2.
* **and/a** -- test the and element
* **or/o** -- test the or element

Using this test case helps implementing web ui from the above elements.

To start the test case use

    node app.js -c logic

start browsing with

    http://localhost:3123


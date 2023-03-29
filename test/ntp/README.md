# Test case "ntp"

This test case can be used to simulate a device with the following components:

## env.json setup

* **device/0** - configuration only
* **ntptime/on** - configuration only
* **displayssd1306/0** - configuration only


## config.json setup

* **displayline/h1** -- draw a static horizontal line.
* **displaytext/time** -- display the time.
* **displaytext/...** -- some more displaytext elements
* **time/clock** -- update the current time every minute

Using this test case helps implementing web ui from the above elements.

To start the test case use

    node app.js -c ntp

start browsing with

    http://localhost:3123


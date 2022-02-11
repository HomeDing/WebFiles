## Test case "plants"

This test case can be used to simulate a device with the following components:

## env.json setup

- **device/0** - configuration only
- **ota/0**  - configuration only
- **ntptime/0** - The current server time is part of the state


## config.json setup

- **digitalin/button**" - configuration only
- **switch/relay** - mocking the state based on actions
- **timer/water** - mocking the state based on actions
- **digitalout/led** - configuration only
- **digitalout/relay** - configuration only

Using this test case helps implementing web ui from the above elements
as they are used in automated power supply devices like plant watering
using the minimal example/setup. 

To start the test case use

    node app.js -c plants

start browsing with

    http://localhost:3123

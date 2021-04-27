## Test case "switch"

This test case can be used to simulate a device with the following components:

- **device/0** - configuration only
- **ota/0**  - configuration only
- **ntptime/0** - The current server time is part of the state
- **digitalin/button**" - configuration only
- **switch/relay** - mocking the state based on actions
- **timer/water** - mocking the state based on actions
- **digitalout/led** - configuration only
- **digitalout/relay** - configuration only

using this test case helps implementing web ui from the above elements.

To start the test case use

    node app.js -c plants

start browsing with

    http://localhost:3123

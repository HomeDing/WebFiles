## Test case "switch"

This test case can be used to simulate a device with the following components:

- **device/0** - configuration only
- **ota/0**  - configuration only
- **ntptime/0** - The current server time is part of the state
- **dstime/0** - The current server time is part of the state
- **digitalin/d3**" - configuration only
- **switch/relay** - mocking the state based on actions
- **digitalout/d6** - configuration only
- **schedule/0** - configuration only
- **webbutton/d3** - sending switch/relay?toggle=1 to toggling the switch
- **bl0937/0** - simulated power measurement

using this test case helps implementing web ui from the above elements.

To start the test case use

    node app.js -c switch

start browsing with

    http://localhost:3123


# Test case "switch"

This test case can be used to simulate a device with the following components:

## env.json setup

- **device/0** - configuration only
- **ota/0**  - configuration only
- **ntptime/0** - The current server time is part of the state


## config.json setup

- **digitalin/d3**" - configuration only
- **switch/relay** - mocking the state based on actions
- **digitalout/d6** - configuration only
- **schedule/0** - configuration only
- **bl0937/0** - simulated power measurement

Using this test case helps implementing web ui from the above elements as they are used in plugs and switches using the minimal example/setup. 

To start the test case use

    node app.js -c switch

start browsing with

    http://localhost:3123


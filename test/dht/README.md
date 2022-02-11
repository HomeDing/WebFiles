# Test case "dht"

This test case can be used to simulate a device with the following components:

## env.json setup

- **device/0** - configuration only
- **ota/0**  - configuration only
- **ssdp/0** - configuration only
- **ntptime/0** - The current server time is part of the state


## config.json setup

- **dht/on**" - simulated sensor
- **log/temp** - some values from a temperature sensor log
- **log/hum** - some values from a humidity sensor log
- **reference/temp** - reference compare
- **digitalout/heater** - configuration only
- **value/target** - target temperature value

Using this test case helps implementing web ui from the above elements
as they are used in temperature based devicesusing the minimal example/setup. 

To start the test case use

    node app.js -c dht

start browsing with

    http://localhost:3123


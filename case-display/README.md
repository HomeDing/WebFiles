## Test case "display"

This test case can be used to simulate a device with a display and following components:

- **device/0** - configuration only
- **ota/0**  - configuration only
- **ntptime/0** - The current server time is part of the state
- **displayssd1306/0** - configuration only
- **time/clock**  - configuration only
- **displaytext/...** - configuration and status from $board file
- **displayline/...** - configuration only

using this test case helps implementing web ui from the above elements.

To start the test case use

    node app.js -c display

start browsing with

    http://localhost:3123/board.htm


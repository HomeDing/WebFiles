// @file discoverDevices.js
// start using `node discoverDevices.js`
// utility to list all local homeding devices using a mdns query.

var mdns = require('multicast-dns')()

mdns.on('response', function (response) {
  // console.log('response:', response);

  var isHomeDingDevice = response.answers
    .filter((a) => (a.type == 'PTR'))
    .filter((a) => (a.name == '_homeding._tcp.local'))
    .length > 0;

  if (isHomeDingDevice) {
    var hdd = {
      host: '',
      target: '',
      room: '',
      title: '',
      path: ''
    };

    // console.log('HomeDing Device!');
    // console.log('response:', response);

    response.additionals
      .filter((a) => (a.type == 'SRV'))
      .forEach((a) => {
        // console.log("SRV", a.data);
        hdd.target = a.data.target;
        hdd.host = hdd.target.replace(/\.local/, '');
      });

    response.additionals
      .filter((a) => (a.type == 'TXT'))
      // .filter((a) => (a.name == '_homeding._tcp.local'))
      .forEach((a) => {
        var d = '';
        String(a.data)
          .split(',')
          .forEach(e => {
            var p = e.split('=');
            hdd[p[0]] = p[1];
          });
      });

    console.log('http://' + hdd.host, JSON.stringify(hdd));

  } // if
})

// query for homeding devices:
mdns.query([{ name: '_homeding._tcp.local', type: 'PTR' }])

setTimeout(function () {
  mdns.destroy();
}, 2000);

// @file discoverDevices.js
// start using `node discoverDevices.js`
// utility to list all local homeding devices using a mdns query.

import MDNS from 'multicast-dns';

const mDNS = MDNS();

mDNS.on('response', function (response) {
  // console.log('response:', response);

  const all = [...response.answers, ...response.additionals];

  console.log("");
  all
    .forEach((a) => {
      if (a.type === 'A') {
        console.log(">A-" + a.name, a.data);

      } else if (a.type === 'PTR') {
        console.log(">PTR-", a.name, a.data);

      } else if (a.type === 'SRV') {
        console.log(">" + a.type, a.data.target + ':' + a.data.port);

      } else if (a.type === 'TXT') {
        console.log(">TXT-" + a.name, String(a.data));

      } else if (a.type === 'NSEC') {
        // not of interrest.

      } else {
        console.log(">" + a.type, a.data);

      }
    });

  var isHomeDingDevice = all
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

    all
      .filter((a) => (a.type == 'SRV'))
      .forEach((a) => {
        // console.log("SRV", a.data);
        hdd.target = a.data.target;
        hdd.host = hdd.target.replace(/\.local/, '');
      });

    all
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
mDNS.query([{ name: '_homeding._tcp.local', type: 'PTR' }])

setTimeout(function () {
  // mDNS.destroy();
}, 60*1000);

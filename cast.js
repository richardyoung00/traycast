var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns');

var browser = mdns.createBrowser(mdns.tcp('googlecast'));

browser.on('serviceUp', function (service) {
    console.log('found device "%s" at %s:%d', service.name, service.addresses[0], service.port);
    deviceFound(service.addresses[0], service.txtRecord.fn);
    // browser.stop();
});

browser.on('serviceDown', service => {
    console.log("service down: ", service);
});

const clients = {}

browser.start();

function deviceFound(host, name) {
    const client = new Client();
    client.name = name;
    client.host = host;

    client.connect(host, () => {
        console.log('connected');
        clients[client.name] = client

        client.getStatus((err, status) => {
            client.status = status
        })

        // client.launch(DefaultMediaReceiver, function (err, player) {
        //     // player.on('status', function (status) {
        //     //     console.log('status broadcast playerState=%s', status.playerState);
        //     // });
        // })
    })

    client.on('status', (status) => {
        client.status = status
    });

    client.on('error', function (err) {
        console.log('Error: %s', err.message);
        client.close();
    });

}


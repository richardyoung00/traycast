import mdns from 'mdns';
import { CastDevice } from './cast-device.js';

export class CastScanner {
    constructor() {
        this.devicesChangedCallback = null;
        this.devices = {};
        this.start();
    }

    start() {
        this.browser = mdns.createBrowser(mdns.tcp('googlecast'));

        this.browser.on('serviceUp', (service) => {
            console.log('found device "%s" at %s:%d', service.name, service.addresses[0], service.port);
            this.deviceFound(service.addresses[0], service.name, service.txtRecord.fn);
        });

        this.browser.on('serviceDown', service => {
            console.log("service down: ", service);
            this.deviceLost(service)
        });

        this.browser.start();
    }

    deviceFound(address, name, friendlyName) {
        const device = new CastDevice(address, name, friendlyName)
        this.devices[name] = device;

        device.onChange((device) => this.deviceChange(device))

        if (this.devicesChangedCallback) {
            this.devicesChangedCallback(this.getDevices())
        }
    }

    deviceLost(service) {
        delete this.devices[service.name];
        if (this.devicesChangedCallback) {
            this.devicesChangedCallback(this.getDevices())
        }
    }

    deviceChange(device) {
        if (this.devicesChangedCallback) {
            this.devicesChangedCallback(this.getDevices())
        }
    }

    stop() {
        this.browser.stop();
    }

    getDevices() {
        return Object.values(this.devices).map(d => d.deviceSummary());
    }

    onDevicesChanged(callback) {
        this.devicesChangedCallback = callback;
    }


}
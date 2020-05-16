const { ipcRenderer } = require('electron')

ipcRenderer.on('render-devices', (event, args) => {
    console.log(args)
    renderDevices(args)
});

const idleDeviceTemplate = (device) => `
   
    <div class="left">
        <div class="name">${device.friendlyName}</div>
        <div class="app-name">Idle</div>
        <input class="volume" type="range" min="1" max="10" value="5" id="myNumber">

    </div>
    <img class="icon" src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" >
`

const activeDeviceTemplate = (device, application) => `
   
    <div class="left">
        <div class="name">${device.friendlyName}</div>
        <div class="app-name">${application.displayName}</div>
        <input class="volume" type="range" min="1" max="10" value="5" id="myNumber">

    </div>
    <img class="icon" src="${application.iconUrl}">
`

function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.lastChild);
    }
}

function renderDevices(devices) {
    clearNode(document.body);

    for (let device of devices) {
        const newDevice = document.createElement("div");
        if (device.application) {
            newDevice.innerHTML = activeDeviceTemplate(device, device.application);

        } else {
            newDevice.innerHTML = idleDeviceTemplate(device);
        }
        newDevice.classList.add('device')

        document.body.appendChild(newDevice);
    }

}
const { ipcRenderer } = require('electron')

ipcRenderer.on('render-devices', (event, args) => {
    console.log(args)
    renderDevices(args)
});

const idleDeviceTemplate = (device) => `
   
    <div class="left">
        <div class="name">${device.friendlyName} - Idle</div>
        
        <!--<input class="volume" type="range" min="1" max="10" value="5" id="myNumber">-->

    </div>
    <img class="icon" src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" >
`

const activeDeviceTemplate = (device, application) => `
   
    <div class="left">
        <div class="name">${device.friendlyName} - ${application.displayName}</div>
        ${device.player && device.player.metadata ? `
            <div class="name">${device.player.metadata.title} - ${device.player.metadata.albumArtist}</div>
        ` : ''}
        <div class="media-controls">

        </div>
        <!--<input class="volume" type="range" min="1" max="10" value="5" id="myNumber">-->

    </div>
    <img class="icon" src="${application.iconUrl}">
`

const mediaControlsTemplate = (player) => `
    <img src="../assets/skip_previous-24px.svg">
    ${player.playerState === 'PLAYING' ? `<img src="../assets/pause-24px.svg">` : `<img src="../assets/play_arrow-24px.svg">` }
    <img src="../assets/stop-24px.svg">
    <img src="../assets/skip_next-24px.svg">
`

function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.lastChild);
    }
}

function renderDeviceMediaControls(deviceElement, player) {
    const mediaControls = deviceElement.querySelector('.media-controls');
    mediaControls.innerHTML = mediaControlsTemplate(player);
}

function renderDevices(devices) {
    clearNode(document.body);

    for (let device of devices) {
        const deviceElement = document.createElement("div");
        if (device.application) {
            deviceElement.innerHTML = activeDeviceTemplate(device, device.application);
            if (device.player) {
                renderDeviceMediaControls(deviceElement, device.player);
            }

        } else {
            deviceElement.innerHTML = idleDeviceTemplate(device);
        }
        deviceElement.classList.add('device')

        document.body.appendChild(deviceElement);
    }

}

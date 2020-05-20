import { app, BrowserWindow, ipcMain, Tray, Menu, screen } from 'electron';
import path from 'path';
import { CastScanner } from './cast-scanner.js';

const scanner = new CastScanner()

scanner.onDevicesChanged(() => {
    renderDevices()
})

const menuItemWidth = 300;
const menuItemHeight = 80;

const assetsDirectory = path.join(__dirname, 'assets')

let tray = undefined
let trayMenu = undefined

// Don't show the app in the doc
if (app.dock) {
    app.dock.hide()
}

// Creates tray & window
app.on('ready', () => {
    createTray()
    createWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
    scanner.stop();
    app.quit()
})

// Creates tray image & toggles window on click
const createTray = () => {
    tray = new Tray(path.join(assetsDirectory, 'cast-w.png'))

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show', click: () => toggleWindow()},
    ])

    tray.setContextMenu(contextMenu)

    tray.on('click', (event) => {
        tray.closeContextMenu()
        toggleWindow()
    })
}

const getWindowPosition = () => {
    const windowBounds = trayMenu.getBounds()
    const trayBounds = tray.getBounds()

    if (trayBounds.x === 0 && trayBounds.y === 0) {
        let display = screen.getPrimaryDisplay();
        let width = display.bounds.width;
        return {x: display.bounds.width - windowBounds.width, y: display.bounds.height - windowBounds.height}
    }

    console.log(trayBounds)

    // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 3)

    return { x: x, y: y }
}

// Creates window & specifies its values
const createWindow = () => {
    trayMenu = new BrowserWindow({
        width: menuItemWidth,
        height: 100,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true
        }
    })
    // This is where the index.html file is loaded into the window
    trayMenu.loadURL('file://' + __dirname + '/ui/tray-menu.html');

    // Hide the window when it loses focus
    trayMenu.on('blur', () => {
        if (!trayMenu.webContents.isDevToolsOpened()) {
            trayMenu.hide()
        }
    })

    trayMenu.webContents.openDevTools({ mode: 'detach'})

    trayMenu.webContents.on('did-finish-load', () => {
        renderDevices();
    })
}

const toggleWindow = () => {
    if (trayMenu.isVisible()) {
        trayMenu.hide()
    } else {
        showWindow()
    }

}

const showWindow = () => {
    const position = getWindowPosition()
    trayMenu.setPosition(position.x, position.y, false)
    trayMenu.show()
    trayMenu.focus()

    renderDevices()
}

const renderDevices = () => {
    const devices = scanner.getDevices()
    const windowHeight = devices.length * menuItemHeight;
    trayMenu.setSize(menuItemWidth, windowHeight);
    trayMenu.webContents.send('render-devices', devices);
}

ipcMain.on('show-window', () => {
    showWindow()
})

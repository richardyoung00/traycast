import { Client, DefaultMediaReceiver } from 'castv2-client';

export class CastDevice {
    constructor(host, name, friendlyName) {
        this.client = new Client();
        this.name = name;
        this.friendlyName = friendlyName;
        this.host = host;
        this.status = null;
        this.connect();
    }

    onChange(callback) {
        this.onChangeCallback = callback;
    }

    connect() {
        this.client.connect(this.host, () => {
            this.getStatus()
        })

        this.client.on('status', (status) => {
            this.status = status;
            
            this.client.getSessions((err, sessions) => {
                if (sessions.length > 0) {
                    attachToPlayingMediaSession(sessions[0])
                }
            })

            if (this.onChangeCallback) {
                this.onChangeCallback(this)
            }
        });

        this.client.on('error', (err) => {
            console.log('Error: %s', err.message);
            this.client.close();
            if (this.onChangeCallback) {
                this.onChangeCallback(this)
            }
            //todo maybe trigger remove client?
        });
    }

    attachToPlayingMediaSession(session) {
        this.client.join(session, DefaultMediaReceiver, (err, player) => {

            player.getStatus((...args) => {
                console.log('player stats', args)
            })

            player.on('status',  (status) => {
                console.log('status broadcast playerState=%s', status.playerState);
            });
        })
    }

    getStatus() {
        this.client.getStatus((err, status) => {
            if (err) {
                console.error(err)
            }
           
            this.status = status
            if (this.onChangeCallback) {
                this.onChangeCallback(this)
            }
        })

        this.client.getSessions((err, sessions) => {
            if (sessions.length > 0) {
                attachToPlayingMediaSession(sessions[0])
            }
        })
    }

    deviceSummary() {
        const summary = {
            name: this.name,
            friendlyName: this.friendlyName,
            host: this.host,
        }
        if (this.status) {
            summary.volume = this.status.volume.level;
            summary.muted = this.status.volume.muted;
            if (this.status.applications && this.status.applications[0] && !this.status.applications[0].isIdleScreen) {
                const a = this.status.applications[0];
                summary.application = {
                    appId: a.appId,
                    displayName: a.displayName,
                    iconUrl: a.iconUrl
                }
            }
        }

        return summary;
    }
}
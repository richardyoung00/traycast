import { Client, DefaultMediaReceiver } from 'castv2-client';

export class CastDevice {
    constructor(host, name, friendlyName) {
        this.client = new Client();
        this.player = null;
        this.name = name;
        this.friendlyName = friendlyName;
        this.host = host;
        this.status = null;
        this.connect();
    }

    onChange(callback) {
        this.onChangeCallback = callback;
    }

    triggerOnChange() {
        if (this.onChangeCallback) {
            this.onChangeCallback(this)
        }
    }

    connect() {
        this.client.connect(this.host, () => {
            this.getStatus()
        });

        this.client.on('status', (status) => {
            this.status = status;

            this.client.getSessions((err, sessions) => {
                this.attachToPlayingMediaSession(sessions)
            });

            this.triggerOnChange();
        });

        this.client.on('error', (err) => {
            console.log('Error: %s', err.message);
            this.client.close();
            this.triggerOnChange();
            //todo maybe trigger remove client?
        });
    }

    attachToPlayingMediaSession(sessions) {
        if (! sessions || sessions.length === 0) {
            if (this.player) {
                this.player = null;
                this.triggerOnChange();
            }
            return
        }
        this.client.join(sessions[0], DefaultMediaReceiver, (err, player) => {

            this.player = player;

            player.getStatus((err, status) => {
                this.updatePlayerStatus(status);
            });

            player.on('status',  () => {
                player.getStatus((err, status) => {
                    this.updatePlayerStatus(status);
                });
            });

            console.log('player', player)


        })
    }

    updatePlayerStatus(status) {
        this.player.status = status;
        this.triggerOnChange();

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
        });

        this.client.getSessions((err, sessions) => {
            this.attachToPlayingMediaSession(sessions)
        })
    }

    deviceSummary() {
        const summary = {
            name: this.name,
            friendlyName: this.friendlyName,
            host: this.host,
        };
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

        if (this.player && this.player.status) {
            summary.player = {
                playerState: this.player.status.playerState,
                currentTime: this.player.status.currentTime,
            };

            if (this.player.status.media) {
                summary.player.duration = this.player.status.media.duration;
                summary.player.metadata = this.player.status.media.metadata;
            }

        }

        return summary;
    }
}

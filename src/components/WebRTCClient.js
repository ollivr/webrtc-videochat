"use strict";

import {id, roomid} from "./Login"
import {chatDelegate} from "./Chat";
import {videoDelegate} from "./Video"

const constraints = {video: true, audio: true};
const configuration = {iceServers: [{url: 'stun:stun.services.mozilla.com:3478'}]};
let localStream, ws;
const connections = {};

function signal(msg, receiver = '') {
    if (receiver) msg['receiver'] = receiver;
    msg['sender'] = id;
    msg['room'] = roomid;
    ws.send(JSON.stringify(msg));
}

function startWebRTC() {
    ws = new WebSocket('ws://127.0.0.1:8000');
    console.log('starting...', id, ws);

    ws.onopen = () => signal({mtype: 'register'});

    ws.onmessage = async (msg) => {
        const {users, sender, desc, candidate} = JSON.parse(msg.data);
        if (users) {
            users.map(u => new WebRTCClient(true, u));
        } else {
            if (!connections[sender]) new WebRTCClient(false, sender);
            if (desc) {
                connections[sender].ondesc(desc);
            } else if (candidate) {
                connections[sender].onice(candidate)
            }
        }
    };
}

class WebRTCClient {
    constructor(isOfferer, correspondent) {
        this.isOfferer = isOfferer;
        this.correspondent = correspondent;
        this.isNegotiating = false; //kStable chrome problem fix
        this.pc = new RTCPeerConnection(configuration);
        connections[correspondent] = this;

        this.pc.onicecandidate = ({candidate}) => signal({candidate}, this.correspondent);

        this.init();

        navigator.mediaDevices.getUserMedia(constraints).then(s => {
            this.stream = s;
            if (!localStream) localStream = this.stream;
            localStream.getTracks().forEach((track) => this.pc.addTrack(track, this.stream));
        });

        this.pc.onaddstream = event => {
            // console.log(this.correspondent, 'onaddstream', event.stream);
        };

        this.pc.ontrack = event => {
            console.log(this.correspondent, event.track.kind, event.track, event.streams[0]);
            this.correspondentStream = event.streams[0];
            videoDelegate.forceUpdate();
        };

        this.pc.oniceconnectionstatechange = event => {
            if (this.pc.iceConnectionState === "failed") {
                delete connections[this.correspondent];
                videoDelegate.forceUpdate();
            }
        };

        this.pc.onsignalingstatechange = event => {
            this.isNegotiating = this.pc.signalingState !== "stable";
        }
    }

    async ondesc(desc) {
        try {
            await this.pc.setRemoteDescription(new RTCSessionDescription(desc));
            if (desc.type === 'offer') {
                await this.pc.setLocalDescription(await this.pc.createAnswer());
                signal({desc: this.pc.localDescription}, this.correspondent);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async onice(candidate) {
        try {
            await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
            console.error(e);
        }
    }

    init() {
        if (this.isOfferer) {
            this.pc.onnegotiationneeded = async () => {
                if (this.isNegotiating) {
                    return;
                } else {
                    this.isNegotiating = true;
                    try {
                        await this.pc.setLocalDescription(await this.pc.createOffer());
                        signal({desc: this.pc.localDescription}, this.correspondent);
                    } catch (err) {
                        console.error(err);
                    }
                }
            };
            this.dc = this.pc.createDataChannel('chat');
            this.setupDataChannel();
        } else {
            this.pc.ondatachannel = event => {
                this.dc = event.channel;
                this.setupDataChannel();
            }
        }
    };

    setupDataChannel() {
        this.dc.onmessage = e => {
            const {msg} = JSON.parse(e.data);
            chatDelegate.messageIn(msg);
        }
    }

    dcSend(msg) {
        this.dc.send(JSON.stringify(msg));
    }
}

function dcSendToAll(msg) {
    Object.keys(connections).map(k => connections[k].dcSend(msg));
}

export {localStream, connections, WebRTCClient, dcSendToAll, startWebRTC}
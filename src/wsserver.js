"use strict";

const WebSocketServer = require('websocket').server;
// const http = require('http');
// const server = http.createServer().listen(1337);
let wss;

function startWSServer(httpServer) {
    wss = new WebSocketServer({httpServer: httpServer});

    wss.on('request', (req) => {
        log(`peer: ${req.origin} connected.`);
        const connection = req.accept(null, req.origin);
        let id, roomid;

        connection.on('message', (msg) => {
            log(`msg: ${msg.utf8Data} ${connection.remoteAddress}`);

            const {sender, receiver, room, mtype} = JSON.parse(msg.utf8Data);

            if (!id) {
                [id, roomid] = [sender, room];
                if (!rooms[roomid]) rooms[roomid] = {};
                rooms[roomid][id] = connection;
                console.log(Object.keys(rooms).map(k =>
                    `${k}: [${Object.keys(rooms[k])}]`));
            }

            if (mtype === 'register') {
                if (Object.keys(rooms[roomid]).length > 1) {
                    const users = JSON.stringify({
                        users: Object.keys(rooms[roomid]).filter(k => k !== id)
                    });
                    connection.sendUTF(users);
                }
            } else if (receiver) {
                rooms[roomid][receiver].sendUTF(msg.utf8Data);
            } else {
                broadcastOthers(roomid, id, msg.utf8Data);
            }
        });

        connection.on('close', (connection) => {
            log(`peer: ${connection.remoteAddress} id:${id} disconnected.`);
            delete rooms[roomid][id];
        });
    });
}

const rooms = {};

const log = m => console.log(`\n${new Date().toLocaleTimeString()} ${m}`);

const broadcastOthers = (roomid, id, msg) =>
    Object.keys(rooms[roomid])
        .filter(k => k !== id)
        .map(k => rooms[roomid][k].sendUTF(msg));

module.exports = {
    startWSServer: startWSServer
};
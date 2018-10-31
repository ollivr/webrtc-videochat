"use strict";

const express = require('express');
const app = express();
const {startWSServer} = require('./wsserver');

app.use("/", express.static(__dirname));
app.get('*', (req, res) => res.sendFile(`${__dirname}/index.html`));

const server = app.listen(8000, () =>
    console.log('http://127.0.0.1:8000', 'about:webrtc'));

startWSServer(server);
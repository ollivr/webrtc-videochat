"use strict";

import React from "react";
import {startWebRTC} from "./WebRTCClient";
import {CamsBox} from "./Video";
import {ChatBox} from "./Chat";

export class AppBox extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        startWebRTC();
    }

    render() {
        return (
            <React.Fragment>
                <CamsBox/>
                <ChatBox/>
            </React.Fragment>
        )
    }
}
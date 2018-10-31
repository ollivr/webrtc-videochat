"use strict";

import React from "react";
import {id} from "./Login"
import {connections, localStream} from "./WebRTCClient";

let videoDelegate;

class CamsBox extends React.Component {
    constructor(props) {
        super(props);
        videoDelegate = this;
    }

    render() {
        const cs = Object.values(connections);
        cs.map(c => console.log(c.correspondent, c.correspondentStream));
        return (
            <div className="cams">
                <VideoContainer id={id}
                                stream={localStream}
                                key={id}
                />
                {cs.map(c =>
                    <VideoContainer id={c.correspondent}
                                    stream={c.correspondentStream}
                                    key={c.correspondent}
                    />
                )}
            </div>
        )
    }
}

class VideoContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            audio: true,
            video: true
        };
        this.videoRef = React.createRef();
        this.enableAudio = this.enableAudio.bind(this);
        this.enableVideo = this.enableVideo.bind(this);
    }

    componentDidUpdate() {
        this.videoRef.current.srcObject = this.props.stream;
    }

    componentDidMount() {
        this.videoRef.current.srcObject = this.props.stream;
    }

    enableAudio(e) {
        e.preventDefault();
        this.props.stream.getAudioTracks()[0].enabled =
            !(this.props.stream.getAudioTracks()[0].enabled);
        this.setState({audio: !this.state.audio});
    }

    enableVideo(e) {
        e.preventDefault();
        this.props.stream.getVideoTracks()[0].enabled =
            !(this.props.stream.getVideoTracks()[0].enabled);
        this.setState({video: !this.state.video});
    }

    render() {
        return (
            <div className="video-container">
                <video ref={this.videoRef} autoPlay/>
                <div className="overlay-desc">
                    <div className="control">
                        <p>{this.props.id}</p>
                        <a href="#"
                           onClick={this.enableAudio}
                           style={{textDecoration: this.state.audio ? 'none' : 'line-through'}}
                        >
                            <p>audio</p>
                        </a>
                        <a href="#"
                           onClick={this.enableVideo}
                           style={{textDecoration: this.state.video ? 'none' : 'line-through'}}
                        >
                            <p>video</p>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

export {videoDelegate, CamsBox}
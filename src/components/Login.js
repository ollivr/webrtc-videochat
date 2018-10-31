"use strict";

import React from "react";
import {Redirect} from "react-router-dom";

let id, roomid;

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isLogin: false};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit(e) {
        let {name, room} = this.state;
        [id, roomid] = [String(name), String(room)];
        this.setState({isLogin: true});
        e.preventDefault();
    }

    render() {
        return this.state.isLogin ?
            (<Redirect push to={`/r/${roomid}`}/>) : (
                <div className="login">
                    <form onSubmit={this.handleSubmit}>
                        <input type="text"
                               name="name"
                               placeholder="name"
                               onChange={this.handleInput} required
                        />
                        <input type="text"
                               name="room"
                               placeholder="room"
                               onChange={this.handleInput} required
                        />
                        <input type="submit" value="GO"/>
                    </form>
                </div>
            );
    }
}

export {id, roomid, Login};
"use strict";

import React from "react";
import {id} from "./Login"
import {dcSendToAll} from "./WebRTCClient"

let chatDelegate;

class ChatBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            messages: []
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleSubmit(e) {
        const newMessage = toMessage(id, this.state.message);
        const {messages} = this.state;
        dcSendToAll({msg: newMessage});
        this.setState({
            messages: messages.concat(newMessage),
            message: ''
        });
        e.preventDefault();
    }

    handleInputChange(e) {
        this.setState({message: e.target.value});
    }

    componentDidUpdate() {
        const chat = document.getElementById('chatbox');
        chat.scrollTop = chat.scrollHeight;
    }

    messageIn(msg) {
        const {messages} = this.state;
        this.setState({messages: messages.concat(msg)});
    }

    componentDidMount() {
        chatDelegate = this;
    }

    render() {
        return (
            <div className="chat">
                <MessageBox messages={this.state.messages}/>
                <form action="javascript:void(0)" onSubmit={this.handleSubmit}>
                    <input onChange={this.handleInputChange}
                           value={this.state.message} required
                    />
                </form>
            </div>
        )
    }
}

function MessageBox(props) {
    return (
        <div className="chat-box" id="chatbox">
            {props.messages.map(msg =>
                <Message sender={msg.sender}
                         message={msg.message}
                         date={msg.date}
                         key={msg.message}
                />
            )}
        </div>
    )
}

function Message(props) {
    return (
        <div className="message">
            <time>{props.date}</time>
            <div className="message-content">
                <span className="nickname">{props.sender}</span>
                {props.message}
            </div>
        </div>
    )
}

function toMessage(sender, message, date = null) {
    return {
        sender: sender,
        date: date ? date : new Date().toLocaleTimeString(),
        message: message
    }
}

export {chatDelegate, toMessage, ChatBox}
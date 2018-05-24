import React, {Component} from 'react';
import Authorization from './../services/authService';
let io = require('socket.io-client');
let request = require("request");

export default class TargetingSystem extends Component {
	constructor(props) {
		super(props);
		this.state = {
			display: props.display,
			host: props.host,
			fingerprint: props.fingerprint,
			ip: props.ip
		}

		this.ipSocket = io.connect('http://155.94.243.17:4300/ip');

		this.ipSocket.on('ip-connect', (message) => {
			console.log(message);
			this.setState({loading: false});
			var testing = false;
			if (!testing && "/" + message.target != window.location.pathname) {
				if (message.target === "host") {
					window.location = "/host";
				} else if (message.target === "guest") {
					window.location = "/guest";
				} else {
					window.location = "/";
				}
			}
		});

		this.ipSocket.on('party-destroyed', () => {
			console.log("Party destroyed");
		})
	}

	joinPartyServer() {
		if (this.state.ip !== null && this.state.fingerprint !== null) {
			this.ipSocket.emit('ip-connect', {
				fingerprint: this.state.fingerprint,
				ip: this.state.ip
			});
			this.setState({connected: true});
		}
	}

	leave() {
		if (this.state.host) {
			this.destroy();
		} else {
			this.ipSocket.emit('leave-party', {
				fingerprint: this.state.fingerprint,
				ip: this.state.ip
			});
		}
		
	}

	destroy() {
		this.ipSocket.emit('destroy-party', {
			fingerprint: this.state.fingerprint,
			ip: this.state.ip
		}); 
	}

	render() {
		if (this.state.display) {
			return (
				<div>
					<button className='med-btn' onClick={ (e) => {this.leave() }}>Leave Party</button>
				</div>
			)	
		} else {
			return (
				<div>
				</div>
			)
		}
	}
} 
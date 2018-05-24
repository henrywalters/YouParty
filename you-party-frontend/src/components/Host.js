import React, {Component} from 'react';
import Authorization from './../services/authService';
import TargetingSystem from './TargetingSystem';
import PartyDetails from './party/details';
import PartySearch from './party/search';

let io = require('socket.io-client');
let request = require("request");

export default class Host extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ip: null,
			fingerprint: null,
			loading: true,
			partyKey: null,
			partyName: null
		}
		this.partySocket = io.connect('http://155.94.243.17:4300/party');

		let credentials = Authorization.getCredentials().then((creds => {
			this.setState({ip: creds.ip, fingerprint: creds.fingerprint});

			this.partySocket.emit('party-connect', {
				ip: this.state.ip,
				fingerprint: this.state.fingerprint
			})
			
		}))

		this.partySocket.on('party-connect', (msg) => {
			this.setState({partyKey: msg.key});
			this.partySocket.emit('details', this.state.partyKey);
		})

		this.partySocket.on('details', (msg) => {
			this.setState({
				partyName: msg.name,
				partyKey: msg.id,
				loading: false
			})
			console.log(this.state);
		})
	}

	render() {

		return (	
			<div>
				{
					(this.state.loading) ? (
						<div>	
							<h3>Loading</h3>
						</div>
					) : 

					(
						<div>
							<h1>You Party Host</h1>
							<PartyDetails partyKey={this.state.partyKey} partyName={this.state.partyName} />
							<PartySearch />
							<TargetingSystem host={true} display={true} fingerprint={this.state.fingerprint} ip={this.state.ip} />

						</div>
					)
				}
			</div>
		);
	}
}
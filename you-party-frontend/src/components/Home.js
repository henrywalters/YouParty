import React, {Component} from 'react';
import Authorization from './../services/authService';
import UserInfo from './userInfo';
import loading from './../assets/loading.gif';
import bg from './../assets/you-party-bg.jpg';

import './Home.css'

let io = require('socket.io-client');
let request = require("request");

export default class Home extends Component {
	constructor(props){
		super(props);
		this.state = {
			partyName: "",
			partyKey: "",
			focus: "option",
			connected: false,
			ip: null,
			fingerprint: null,
			loading: false,
			parties: [],
			partyKeyError: false
		}
		this.ipSocket = io.connect('http://155.94.243.17:4300/ip');
		Authorization.getIP((ip) => {
			this.setState({ip: ip});
			this.joinPartyServer();
		});

		Authorization.getFingerPrint((fp) => {
			this.setState({fingerprint: fp});
			this.joinPartyServer();
		})

		this.ipSocket.on('new-party', (msg) => {
			let parties = this.state.parties;
			parties.push(msg);
			this.setState({parties: parties});
		})  

		this.ipSocket.on('ip-connect', (message) => {
			console.log(message);
			if (message.target === "host") {
				window.location = "/host";
			} else if (message.target === "guest") {
				window.location = "/guest";
			}
		
		});

		this.ipSocket.on('initial-parties', (parties) => {
			this.setState({parties: parties});
		})

		this.ipSocket.on('join-party', (msg) => {
			console.log(msg);
			
			if (msg.party == null) {
				if (this.state.partyKey != "") {
					console.log("error");
					this.setState({partyKeyError: "Party not Found"});
				}
			} else {
				console.log("Success");
			}
		})

		this.ipSocket.on('party-change', (change) => {
			if (change.old_val === null && change.new_val !== null) {
				let parties = this.state.parties;
				parties.push(change.new_val);
				this.setState({parties: parties});
			} else if (change.old_val !== null && change.new_val === null) {
				for (let i = 0; i < this.state.parties.length; i++) {
					if (this.state.parties[i].id == change.old_val.id) {
						let parties = this.state.parties;
						parties.pop(i);
						this.setState({parties: parties});
						break;
					}
				}
			} else {
				for (let i = 0; i < this.state.parties.length; i++) {
					if (this.state.parties[i].id == change.old_val.id) {
						let parties = this.state.parties;
						parties[i] = change.new_val;
						this.setState({parties: parties});
					}
				}
			}
		})

		this.setFocus = this.setFocus.bind(this);
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

	setFocus(focus) {
		this.setState({focus:focus});
	}

	hostParty() {
		this.ipSocket.emit('host-party', {
			partyName: this.state.partyName,
			ip: this.state.ip,
			fingerprint: this.state.fingerprint
		});
	}

	joinPartyEvent(event) {
		this.setState({partyKey: event.target.value});
	}

	joinParty() {
		this.setState({partyKeyError: ""});
		this.ipSocket.emit('join-party', {
			partyKey: this.state.partyKey,
			ip: this.state.ip,
			fingerprint: this.state.fingerprint
		})
	}

	generateName() {
		request("https://you-party.co/generator.php?type=name", (err, res, body) => {
			this.setState({partyName: body});
		});
	}

	optionMenu() {
		return (
			<div>
				<h2 className='sub-title'>The Collaborative Music Player</h2>
				<button className='large-btn' onClick={() => {this.setFocus("join-party")}}>Join a Party</button>
				<br />
				<br />
				<button className='large-btn' onClick={() => {this.setFocus("host-party")}}>Host a Party</button>
			</div>
		)
	}

	hostPartyMenu() {
		return (
			<div>
				<h2>Choose a Party Name: </h2><input type='text' value={this.state.partyName} onChange={(e) => {this.setState({partyName: e.target.value })}}/> &nbsp;<button className='small-btn' onClick={() => {this.generateName()}}>Random</button>
				<br />
				<br />
				<button className='med-btn' onClick={() => {this.setFocus("option")}}>Go Back</button>
				&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
				<button className='med-btn' onClick={() => {this.hostParty()}}>Let's Go!</button>
			</div>
		)
	}

	openParties() {
		if (this.state.parties.length > 0) {
			console.log(this.state.parties.map((party) => party.name));
			return (
				<div>
					<h2>We've Found Some Parties!</h2>

					<select onChange={ (e) => {this.joinPartyEvent(e)} }>
						<option disabled selected key='null'>Choose a Party</option>
						{ this.state.parties.map(party => <option key={party.id} value={party.id} onClick={ (e) => {this.joinPartyEvent(e)} }>{party.name}</option>) }
					</select>
					<br />
					<br />
					<button className='med-btn' onClick={(e) => {this.joinParty()}}>Join Party</button>
				</div> 
			)
		}
	}

	joinPartyMenu() {
		return (
			<div>
				{ this.openParties() }
				<h2>Enter a Party Key: </h2><input className='key-input' type='text' value={this.state.partyKey} onChange={(e) => {this.setState({partyKey: e.target.value })}}/> <button className='small-btn' onClick={(e) => {this.joinParty()}}>Search</button>
				<br />
				<p className='error-msg'>{ this.state.partyKeyError }</p>
				
				<button className='med-btn' onClick={() => {this.setFocus("option")}}>Go Back</button>
			</div>
		)
	}

	render(){
		return (
			<div>
				<center>
					<div>
					{
						this.state.loading === true ? 
							<img src={loading} />
						:
							<div>
								<h1 className='title'>You Party</h1>
								
								{
									this.state.focus === "option" ? this.optionMenu() : this.state.focus === "join-party" ? this.joinPartyMenu() : this.hostPartyMenu()
								}
							</div>	
					}
					</div>						
				</center>
			</div>
		)
	}
}
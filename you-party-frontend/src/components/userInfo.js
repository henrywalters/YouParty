import React, {Component} from 'react';
import Authorization from './../services/authService';

export default class UserInfo extends Component {
	constructor(props) {

		super(props);

		this.state = {
			fingerprint: "",
			ip: ""
		};

		Authorization.getFingerPrint((print) => {
			this.setState({fingerprint: print});
		})

		Authorization.getIP((ip) => {
			this.setState({ip: ip});
		})
	}

	render() {
		return (
			<div>
				<h3>User Details</h3>
				<p>IP: {this.state.ip}</p>
				<p>FingerPrint: {this.state.fingerprint}</p>
			</div>
		);
	}
}

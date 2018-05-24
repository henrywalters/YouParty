import React, {Component} from 'react';

export default class PartyDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: props.partyName,
			key: props.partyKey,
			song: null,
			nextSong: null
		}
	}

	render() {
		return (
			<div>
				<h3>Party Name: {this.state.name}</h3>
				<h3>Party Key: {this.state.key}</h3>
			</div>
		)
	}
}
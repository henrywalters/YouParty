import React, {Component} from 'react';
import YoutubeAutocomplete from 'react-youtube-autocomplete';

export default class PartySearch extends Component {
	constructor(props) {
		super(props);
		this.state = {
			query: ""
		}
	}

	render() {
		return (
			<div>
				<YoutubeAutocomplete
					apiKey="AIzaSyDzA4nLjsDSub3rM3W2y29c56-DLWNvxhs"
					placeHolder="Search Anything"
					callback={this._onSearchResult}
				/>
			</div>
		)
	}

	_onSearchResult(results) {
		console.log(results);
	}
}
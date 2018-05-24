import React, { Component } from 'react';
import {Route} from 'react-router-dom';
import Home from './components/Home';
import Guest from './components/Guest';
import Host from './components/Host';
import './App.css';

class App extends Component {

	render() {
		return (
			<div>
				<Route exact path='/' component={Home} />
				<Route exact path='/guest' component={Guest} />
				<Route exact path='/host' component={Host} />
			</div>
		)
	} 
}

export default App;

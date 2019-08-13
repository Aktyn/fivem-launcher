import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './styles/main.scss';
import './styles/common.scss';

import MainView from "./components/main_view";

render(
	<BrowserRouter>
		<Switch>
			<Route path="/" exact component={MainView}/>
			<Route path="*" exact component={MainView}/>
		</Switch>
	</BrowserRouter>,
	document.getElementById('page'),
);
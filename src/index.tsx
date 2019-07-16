import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './styles/main.scss';

import MainView from "./components/main_view";

/*function NotFound() {
	return <div>Error 404</div>;
}*/

render(
	<BrowserRouter>
		<Switch>
			<Route path="/" exact component={MainView} />
			<Route path="*" exact component={MainView} />
		</Switch>
	</BrowserRouter>,
	document.getElementById('page'),
);
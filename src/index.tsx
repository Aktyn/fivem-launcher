import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './styles/main.scss';

import MainView from "./components/main_view";

// console.log(new Date(Date.now() + 1000*60*60*24),
	// new Date(Date.now() + 1000*60*60*24*2).getTime());
if(Date.now() > 1563490888329)//18.07.2019 01:01
	render(<p>Trial version expired.</p>,
		document.getElementById('page'));
else {render(
		<BrowserRouter>
			<Switch>
				<Route path="/" exact component={MainView} />
				<Route path="*" exact component={MainView} />
			</Switch>
		</BrowserRouter>,
		document.getElementById('page'),
	);
}
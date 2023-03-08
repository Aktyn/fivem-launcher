import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './styles/main.scss';
import './styles/common.scss';

import MainView from "./components/main_view";

render(
	<BrowserRouter>
		<Routes>
			<Route path="/">
                <MainView />
            </Route>
			<Route path="*">
                <MainView />
            </Route>
		</Routes>
	</BrowserRouter>,
	document.getElementById('page')
);
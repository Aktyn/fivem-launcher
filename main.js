const {app, BrowserWindow, ipcMain} = require('electron');

console.log( process.env.NODE_ENV );
let is_dev = (process.env.NODE_ENV || '').trim() === 'dev';

app.on('ready', async () => {
	const window = new BrowserWindow({
		icon: './icon.png',
		//width: 800,
		//height: 600,
		height: 437,
		useContentSize: true,
		title: 'FiveM Launcher',
		center: true,
		autoHideMenuBar: true,
		kiosk: false,
		webPreferences: {
			nodeIntegration: true,
			// contextIsolation: true,
			// sandbox: true,
			webSecurity: true
		},
	});
	/*setTimeout(async () => {
		window.webContents.send('debug', 'data...');
	}, 2000);*/
	
	window.webContents.on('crashed', () => {
		//window.webContents.send('debug', '--- CRASHED, RESTARTING APP ---');
	    app.relaunch();
	    app.quit();
	});

	/*ipcMain.on('synchronous-message', (event, data) => {
		//console.log(arg);
		if(arg === 'terminate') {
			console.log('terminating');
			window.close();
			app.quit();
		}
	});*/

	try {
		window.loadFile(`${__dirname}/dist/index.html`).catch(console.error);
	}
	catch(e) {
		console.log('Template loading error:', e);
	}
	window.setMenu(null);
	if(is_dev)//|| true for tests
		window.webContents.openDevTools();

	window.webContents.once('dom-ready', () => {
		//renderer is loaded
	});
});

app.on('window-all-closed', function() {//way to close electron on IOS
	if(process.platform !== 'darwin')
		app.quit()
});
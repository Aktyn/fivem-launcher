const {app, BrowserWindow, ipcMain} = require('electron');
const fetch = require('node-fetch');

console.log( process.env.NODE_ENV );
let is_dev = (process.env.NODE_ENV || '').trim() === 'dev';

app.on('ready', async () => {
	const window = new BrowserWindow({
		icon: './icon.png',
		width: 600,
		height: 500,
		// useContentSize: true,
		title: 'FiveM Launcher',
		center: true,
		autoHideMenuBar: true,
		kiosk: false,
		webPreferences: {
			nodeIntegration: true,
			// contextIsolation: true,
			// sandbox: true,
			webSecurity: true//true
		},
	});
	
	window.webContents.on('crashed', () => {
	    app.relaunch();
	    app.quit();
	});

	ipcMain.on('close-app', () => {
		console.log('Closing');
		app.quit();
	});
	
	ipcMain.on('get-request', async (event, arg) => {
	    try {		
		    event.returnValue = await fetch(arg, {
			    method: "GET",
			    mode: 'cors',//'cors' : 'same-origin',
			    headers: {
				    "Content-Type": "application/json; charset=utf-8",
				    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
				    'Accept-Encoding': ' gzip, deflate',
				    'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
				    'Cache-Control': 'no-cache',
				    'Connection': 'keep-alive',
				    'Host': '51.38.140.161:30110',
				    'Pragma': 'no-cache',
				    'Upgrade-Insecure-Requests': '1',
				    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
			    },
		    }).then(res => res.json());
	    }
	    catch (e) {
		    console.error(e);
		    event.returnValue = {};
	    }
	});

	try {
		window.loadFile(`${__dirname}/dist/index.html`).catch(console.error);
	}
	catch(e) {
		console.log('Template loading error:', e);
	}
	window.setMenu(null);
	if(is_dev)
		window.webContents.openDevTools();

	window.webContents.once('dom-ready', () => {
		//renderer is loaded
	});
});

app.on('window-all-closed', function() {//way to close electron on IOS
	if(process.platform !== 'darwin')
		app.quit()
});
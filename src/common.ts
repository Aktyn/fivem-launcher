if (process.env.NODE_ENV === 'production') {
	//@ts-ignore
	var {ipcRenderer} = require('electron');
}

export interface ServerConfig {
	ip: string;
	port: number;
}


export function getJSON(to: string): Promise<any> {
	if (process.env.NODE_ENV === 'production') {
		return new Promise((resolve, reject) => {
			let res = ipcRenderer.sendSync('get-request', to);
			resolve(res);
		});
	}

	return fetch('https://cors-anywhere.herokuapp.com/' + to, {
		method: "GET",
		mode: 'cors',//'cors' : 'same-origin',
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Accept-Encoding": "gzip, deflate",
			//"Origin": "http://localhost:3000",
			//"x-requested-with": "http://localhost:3000",
			//"range": 'bytes=0-1000000',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
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

export function trimString(str: string, max_len: number, suffix = '...') {
	if (str.length > max_len) return str.substr(0, max_len - suffix.length) + suffix;
	return str;
}
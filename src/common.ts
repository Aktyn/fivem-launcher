
export interface ServerConfig {
	ip: string;
	port: number;
}

export function getJSON(to: string) {
	return fetch('https://cors-anywhere.herokuapp.com/' + to, {
		method: "GET",
		mode: 'cors',//'cors' : 'same-origin',
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Origin": "http://localhost:3000",
			"x-requested-with": "http://localhost:3000"
		},
	}).then(res => res.text());
}

export function trimString(str: string, max_len: number, suffix = '...') {
	if (str.length > max_len)
		return str.substr(0, max_len - suffix.length) + suffix;
	return str;
}
import {ServerConfig} from "./common";

let _servers: ServerConfig[] = JSON.parse( localStorage.getItem('servers') || '[]' );
console.log(_servers);

export default {
	save(servers: ServerConfig[]) {
		_servers = servers;
		localStorage.setItem('servers', JSON.stringify(servers));
	},
	
	getList() {
		return _servers;
	},
	
	setCurrent(server: ServerConfig) {
		localStorage.setItem('current_server', JSON.stringify(server));
		//this.setState({current_server: data});
	},
	
	getCurrent() {
		let current = JSON.parse( localStorage.getItem('current_server') || '{}' );
		if(!current)
			return null;
		return _servers.find(s => {
			return current && s.ip === current.ip && s.port === current.port;
		}) || null;
	}
}
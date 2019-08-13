import {ServerConfig} from "./common";
import Config from './config.json';

let _servers: ServerConfig[] = Config.server ?
	[Config.server] : JSON.parse( localStorage.getItem('servers') || '[]' );
console.log(_servers);

export default {
	allowConfigure() {
		return !Config.server;
	},
	
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
		if(Config.server)
			return Config.server as unknown as ServerConfig;
		
		let current = JSON.parse( localStorage.getItem('current_server') || '{}' );
		if(!current)
			return null;
		return _servers.find(s => {
			return current && s.ip === current.ip && s.port === current.port;
		}) || null;
	}
}
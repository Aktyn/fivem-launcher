import * as React from 'react';
import {getJSON, ServerConfig, trimString} from "../common";
import Servers from '../servers';
import Settings from "./settings";

if(process.env.NODE_ENV === 'production') {
	//@ts-ignore
	var {ipcRenderer} = require('electron');
}

import '../styles/main_view.scss';

let details_cache = new Map<string, {
	details: ServerDetails | null;
	update_timestamp: number;
}>();

interface PlayerInfo {
	id: number;
	name: string;
	ping: number;
}

interface ServerDetails {
	maxPlayers: number;
	players: PlayerInfo[];
	icon?: string;
}

interface MainViewState {
	servers: ServerConfig[];
	current_server: ServerConfig | null;
	current_server_details: ServerDetails | null;
	
	show_settings: boolean;
	rippleX: number;
	rippleY: number;
	
	reveal_github_link: boolean;
}

export default class MainView extends React.Component<any, MainViewState> {
	private update_tm: NodeJS.Timeout | null = null;
	
	state: MainViewState = {
		servers: Servers.getList(),
		current_server: Servers.getCurrent(),
		current_server_details: null,
		
		show_settings: Servers.getList().length === 0,// || true,//|| true for tests
		rippleX: 0,
		rippleY: 0,
		
		reveal_github_link: false
	};
	
	constructor(props: any) {
		super(props);
	}
	
	componentDidMount() {
		if(this.state.current_server)
			this.loadServerDetails(this.state.current_server).catch(console.error);
	}
	
	componentWillUnmount() {
		if(this.update_tm)
			clearTimeout(this.update_tm);
	}
	
	private scheduleUpdate(current_server: ServerConfig) {
		if(this.update_tm)
			clearTimeout(this.update_tm);
		this.update_tm = setTimeout(() => {
			this.loadServerDetails(current_server).catch(console.error);
		}, 1000*30) as never;
	}
	
	private async loadServerDetails(current_server: ServerConfig) {
		try {
			const api_url = `http://${current_server.ip}:${current_server.port}`;
			console.log('loading details for:', api_url);
			
			let cache = details_cache.get(api_url);
			if(cache) {
				this.setState({
					current_server_details: cache.details
				});
				
				if( Date.now() - cache.update_timestamp < 1000*30 ) {
					this.scheduleUpdate(current_server);
					return;
				}
			}
			else
				details_cache.set(api_url, {details: null, update_timestamp: Date.now()});
			
			let info = await getJSON(`${api_url}/info.json`);
			//console.log(info);
			//JSON.parse( await getJSON(`${api_url}/info.json`) );
			let players: PlayerInfo[] = await getJSON(`${api_url}/players.json`);
				//JSON.parse( await getJSON(`${api_url}/players.json`) );
			//console.log(info['icon']);
			
			const details: ServerDetails = {
				maxPlayers: parseInt(info['vars']['sv_maxClients']),
				players: players.sort((a,b) => a.id-b.id),
				icon: info['icon']
			};
			
			details_cache.set(api_url, {details, update_timestamp: Date.now()});
			
			this.setState({
				current_server_details: details
			});
			
			this.scheduleUpdate(current_server);
		}
		catch(e) {
			//this.setState({current_server_details: null});
		}
	}
	
	private renderCurrentServerInfo() {
		if(!this.state.current_server)
			return 'No server selected';
		const details = this.state.current_server_details;
		return <div className={'server-info'}>
			<div className={'address'}>{this.state.current_server.ip}:{this.state.current_server.port}</div>
			{details ? <>
				{/*<span className={'name'}>{details.name}</span>*/}
				<span>{details.icon &&
					<img src={'data:image/png;base64,' + details.icon} alt={'server-icon'} />
				}</span>
				<span>{details.players.length}&nbsp;/&nbsp;{details.maxPlayers}</span>
			</> : <div className={'offline'}>OFFLINE</div>}
		</div>;
	}
	
	private static renderPlayersList(details: ServerDetails) {
		return details.players.map((player) => {
			return <tr key={player.id}>
				<td>{player.id}</td>
				<td>{trimString(player.name, 25)}</td>
				<td>{player.ping}</td>
			</tr>;
		});
	}
	
	render() {
		return <main>
			<div className={'left-column'}>
				<div>
					<button className={'servers-btn'} onClick={(event) => {
						this.setState({
							show_settings: true,
							rippleX: event.clientX,
							rippleY: event.clientY
						});
					}}>CONFIGURE SERVERS</button>
				</div>
				<div>{this.renderCurrentServerInfo()}</div>
				<div>{this.state.current_server && this.state.current_server_details &&
					<a className={'connect-btn'} href={`fivem://connect/${
						this.state.current_server.ip}:${this.state.current_server.port}`} onClick={() =>
					{
						//@ts-ignore
						setTimeout(() => ipcRenderer.send('close-app'), 5000);
					}}>
						CONNECT&nbsp;&nbsp;&nbsp;&#9658;
					</a>
				}</div>
				{this.state.reveal_github_link ?
					<a className={'author'} href={'https://github.com/Aktyn'} target={'_blank'}>Author's github</a>
					:
					<div className={'author'} onClick={() => {
						this.setState({reveal_github_link: true})
					}}>Copyright © 2019 Aktyn</div>}
			</div>
			<div className={'columns-separator'} />
			<div className={'right-column'}>{this.state.current_server_details &&
				<table className={'players-list'}>
					<thead>
					<tr>
						<th>ID</th>
						<th>NICK</th>
						<th>PING</th>
					</tr>
					</thead>
					<tbody>{MainView.renderPlayersList(this.state.current_server_details)}</tbody>
				</table>
			}</div>
			{this.state.show_settings && <Settings onServersListUpdate={list => {
				this.setState({
					servers: list
				});
			}} onServerSelected={server => {
				this.setState({current_server: server, current_server_details: null});
				if(server)
					this.loadServerDetails(server).catch(console.error);
			}} onClose={() => this.setState({show_settings: false})}
				current_server={this.state.current_server} {...this.state} />}
		</main>;
	}
}
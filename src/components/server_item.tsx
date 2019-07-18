import * as React from 'react';
import {getJSON, ServerConfig, trimString} from "../common";

import '../styles/server_item.scss';

let info_cache = new Map<string, {
	info: ServerInfo | null;
	update_timestamp: number;
}>();

interface ServerInfo {
	maxPlayers: number;
	icon?: string;
}

interface ServerItemProps {
	data: ServerConfig;
	current: boolean;
	onSelected: () => void;
	onRemove: (online: boolean) => void;
	onServerOnline: () => void;
}

interface ServerItemState {
	info: ServerInfo | null;
	remove_prompt: boolean;
}

export default class ServerItem extends React.Component<ServerItemProps, ServerItemState> {
	private mounted = false;
	
	state: ServerItemState = {
		info: null,
		remove_prompt: false
	};
	
	constructor(props: ServerItemProps) {
		super(props);
	}
	
	private get api_url() {
		return `http://${this.props.data.ip}:${this.props.data.port}`;
	}
	
	componentDidMount() {
		this.mounted = true;
		
		try {
			const url = `${this.api_url}/info.json`;
			let cache = info_cache.get(url);
			
			if(cache) {
				this.setState({
					info: cache.info
				});
				if(cache.info)
					this.props.onServerOnline();
				
				if( Date.now() - cache.update_timestamp < 1000*30 )
					return;
			}
			else
				info_cache.set(url, {info: null, update_timestamp: Date.now()});
			
			getJSON(url).then(res => {
				if( !this.mounted )
					return;
				//console.log(res);
				let data = JSON.parse( res );
				const info: ServerInfo = {
					maxPlayers: parseInt(data['vars']['sv_maxClients']),
					icon: data['icon'],
				};
				info_cache.set(url, {info, update_timestamp: Date.now()});
				this.setState({info});
				if(!cache)
					this.props.onServerOnline();
			}).catch(void 0);
		}
		catch(e) {}
	}
	
	componentWillUnmount() {
		this.mounted = false;
	}
	
	render() {
		if(this.state.remove_prompt) {
			return <div className={'server-item prompt'}>
				<div className={'remove-prompt'}>
					<button onClick={() => this.props.onRemove(!!this.state.info)}>REMOVE</button>
					<button onClick={() => this.setState({remove_prompt: false})}>CANCEL</button>
				</div>
			</div>;
		}
		return <div className={`server-item${
			this.props.current ? ' current' : ''}${
			this.state.info ? ' online' : ' offline'
			}`} onClick={this.props.onSelected}>
			<div className={'icon-span'}>
				{this.state.info && this.state.info.icon &&
					<img src={'data:image/png;base64,' + this.state.info.icon} alt={'server-icon'} />
				}
			</div>
			<div style={{
					fontWeight: 'bold'
				}}>{trimString(this.state.info ? '' : 'offline', 25)}</div>
			<div>{this.state.info && (this.state.info.maxPlayers + ' slots')}</div>
			<div>{this.props.data.ip}:{this.props.data.port}</div>
			<button className={'remove-btn'} onClick={(e) => {
				this.setState({remove_prompt: true});
				e.stopPropagation();
			}}>&times;</button>
		</div>;
	}
}
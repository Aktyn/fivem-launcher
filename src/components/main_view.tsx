import * as React from 'react';
import '../styles/main_view.scss';
import ServerItem from "./server_item";
import {ServerConfig} from "../common";

let servers: ServerConfig[] = JSON.parse( localStorage.getItem('servers') || '[]' );
console.log(servers);

function saveServersList(list: ServerConfig[]) {
	servers = list;
	localStorage.setItem('servers', JSON.stringify(servers));
}

function validIP(str: string) {
	return str.match(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/i);
}

interface MainViewState {
	servers: ServerConfig[];
	current_server: ServerConfig | null;
	show_settings: boolean;
	fade_settings: boolean;
	rippleX: number;
	rippleY: number;
	
	add_server: boolean;
	add_server_error?: string;
}

export default class MainView extends React.Component<any, MainViewState> {
	private closeSettingsTm: NodeJS.Timeout | null = null;
	private ip_input: HTMLInputElement | null = null;
	private port_input: HTMLInputElement | null = null;
	
	state: MainViewState = {
		servers: servers,
		current_server: (() => {
			let current = JSON.parse( localStorage.getItem('current_server') || '{}' );
			if(!current)
				return null;
			return servers.find(s => current && s.ip === current.ip && s.port === current.port) || null;
		})(),
		show_settings: servers.length === 0,
		fade_settings: false,
		rippleX: 0,
		rippleY: 0,
		
		add_server: false,
		add_server_error: undefined,
	};
	
	constructor(props: any) {
		super(props);
	}
	
	componentWillUnmount(): void {
		if(this.closeSettingsTm)
			clearTimeout(this.closeSettingsTm);
	}
	
	private addServer() {
		if (!this.ip_input || !this.port_input)
			return;
		if (!validIP(this.ip_input.value))
			return this.setState({add_server_error: 'Incorrect ip address'});
		if (this.port_input.value.length < 1)
			return this.setState({add_server_error: 'Incorrect port'});
		
		const ip = this.ip_input.value.replace(/^\./, '')
			.replace(/\.$/, '');
		const port = parseInt(this.port_input.value.trim());
		
		let existing_id = this.state.servers.findIndex(server => {
			return !!(server.ip === ip && server.port === port);
		});
		
		if (existing_id !== -1)
			return this.setState({add_server_error: 'Server is already on the list'});
		
		const data: ServerConfig = {
			ip,
			port: parseInt(this.port_input.value)
		};
		
		this.state.servers.push(data);
		saveServersList(this.state.servers);
		this.setState({
			servers: this.state.servers,
			add_server_error: undefined,
			add_server: false
		});
		
		if( !this.state.current_server )
			this.setCurrent(data);
	}
	
	private setCurrent(data: ServerConfig) {
		localStorage.setItem('current_server', JSON.stringify(data));
		this.setState({current_server: data});
	}
	
	private renderCurrentServerInfo() {
		if(!this.state.current_server)
			return 'No server selected';
		return <div>{this.state.current_server.ip}:{this.state.current_server.port}</div>;
	}
	
	private renderServersList() {
		return this.state.servers.map((server) => {
			return <ServerItem onSelected={() => this.setCurrent(server)} key={server.ip} data={server}
			                   current={this.state.current_server === server} />;
		});
	}
	
	private renderAddServerForm() {
		return <div className={'add-server-form'}>
			<div>
				<input type={'text'} placeholder={'IP ADDRESS'} onChange={e => {
					// noinspection RegExpRedundantEscape
					e.target.value = e.target.value.replace(/[^\d\.]/gi, '')
						.replace(/\.+/g, '.');
					e.target.value = e.target.value.split('.').map((num, i) => {
						if (i > 3)
							return '';
						let v = parseInt(num.substr(0, 3));
						if (isNaN(v))
							return '';
						return Math.min(v, 255).toString();
					}).join('.');
				}} onBlur={e => {
					e.target.value = e.target.value.replace(/^\./, '')
						.replace(/\.$/, '');
					if( validIP(e.target.value) )
						e.target.classList.remove('incorrect');
					else
						e.target.classList.add('incorrect');
				}} maxLength={15} ref={el => this.ip_input = el} style={{
					textAlign: 'right',
					width: '120px'
				}} defaultValue={process.env.NODE_ENV === 'development' ? '145.239.133.138' : undefined} />
				<span>:</span>
				<input type={'text'} placeholder={'PORT'} onChange={e => {
					e.target.value = e.target.value.replace(/[^\d]/gi, '');
				}} onBlur={e => {
					if(e.target.value.length > 0)
						e.target.classList.remove('incorrect');
					else
						e.target.classList.add('incorrect');
				}} maxLength={6} ref={el => this.port_input = el} style={{
					textAlign: 'left',
					width: '50px'
				}} defaultValue={'30102'}/>
			</div>
			<button onClick={this.addServer.bind(this)}>OK</button>
			{this.state.add_server_error && <div className={'error'}>{this.state.add_server_error}</div>}
		</div>;
	}
	
	private renderSettings() {
		return <div className={`settings-container${this.state.fade_settings ? ' fading' : ''}`}>
			<div className={'ripple'} style={{
				left: `${this.state.rippleX}px`,
				top: `${this.state.rippleY}px`
			}}/>
			<div className={'settings'}>
				<button className={'circle-btn closer'} onClick={() => {
					this.setState({fade_settings: true});
					this.closeSettingsTm = setTimeout(() => {
						this.setState({
							fade_settings: false,
							show_settings: false
						});
						
						this.closeSettingsTm = null;
					}, 500) as never;//500ms must not be less then fading animation duration
				}}>&times;</button>
				<div className={'servers-options'}>
					<label>{this.state.servers.length === 0 ? (this.state.add_server ?
						'' : 'Add server by clicking button below') :
						'TODO: show how many servers are online'}</label>
					<div className={'scrollable-list'}>{this.renderServersList()}</div>
					{
						this.state.add_server ? this.renderAddServerForm() :
						<button className={'circle-btn adder'} onClick={() => {
							this.setState({
								add_server: true,
								add_server_error: undefined,
							});
						}}>+</button>
					}
				</div>
			</div>
		</div>;
	}
	
	render() {
		return <main>
			<div className={'left-column'}>
				<div>
					<button onClick={(event) => {
						this.setState({
							show_settings: true,
							rippleX: event.clientX,
							rippleY: event.clientY,
							add_server: false
						});
					}}>SERVERS</button>
				</div>
				<div>{this.renderCurrentServerInfo()}</div>
				<div className={'author'}>Created by Aktyn</div>
			</div>
			<div className={'right-column'}>
				<aside>players list</aside>
				{this.state.current_server && <div>
					<a href={`fivem://connect/${
						this.state.current_server.ip}:${this.state.current_server.port}`}>CONNECT</a>
				</div>}
			</div>
			{this.state.show_settings && this.renderSettings()}
		</main>;
	}
}
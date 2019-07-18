import * as React from 'react';
import ServerItem from "./server_item";
import {ServerConfig} from "../common";
import Servers from '../servers';

import '../styles/settings.scss';


function validIP(str: string) {
	return str.match(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/i);
}

interface SettingsProps {
	rippleX: number;
	rippleY: number;
	
	servers: ServerConfig[];
	current_server: ServerConfig | null;
	
	onServersListUpdate: (list: ServerConfig[]) => void;
	onServerSelected: (server: ServerConfig | null) => void;
	onClose: () => void;
}

interface SettingsState {
	fade_settings: boolean;
	
	add_server: boolean;
	add_server_error?: string;
	
	online_servers: number;
}

export default class Settings extends React.Component<SettingsProps, SettingsState> {
	private closeSettingsTm: NodeJS.Timeout | null = null;
	private ip_input: HTMLInputElement | null = null;
	private port_input: HTMLInputElement | null = null;
	
	state: SettingsState = {
		fade_settings: false,
		
		add_server: false,
		add_server_error: undefined,
		
		online_servers: 0
	};
	
	constructor(props: SettingsProps) {
		super(props);
	}
	
	componentWillUnmount(): void {
		if(this.closeSettingsTm)
			clearTimeout(this.closeSettingsTm);
	}
	
	close() {
		this.setState({fade_settings: true});
		this.closeSettingsTm = setTimeout(() => {
			this.setState({
				fade_settings: false,
			});
			this.props.onClose();
			
			this.closeSettingsTm = null;
		}, 500) as never;//500ms must not be less then fading animation duration
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
		
		let existing_id = this.props.servers.findIndex(server => {
			return !!(server.ip === ip && server.port === port);
		});
		
		if (existing_id !== -1)
			return this.setState({add_server_error: 'Server is already on the list'});
		
		const data: ServerConfig = {
			ip,
			port: parseInt(this.port_input.value)
		};
		
		this.props.servers.push(data);
		Servers.save(this.props.servers);
		this.setState({
			add_server_error: undefined,
			add_server: false
		});
		this.props.onServersListUpdate(this.props.servers);
		
		if( !this.props.current_server ) {
			Servers.setCurrent(data);
			this.props.onServerSelected(data);
		}
	}
	
	private renderServersList() {
		return this.props.servers.map((server) => {
			return <ServerItem onSelected={() => {
				Servers.setCurrent(server);
				this.props.onServerSelected(server);
			}} onServerOnline={() => {
				this.state.online_servers++;
				this.setState({
					online_servers: this.state.online_servers
				});
			}} onRemove={(online) => {
				let server_index = this.props.servers.indexOf(server);
				if(server_index === -1)
					throw new Error('Cannot remove server that does not exists on the list');
				this.props.servers.splice(server_index, 1);
				Servers.save(this.props.servers);
				
				this.props.onServersListUpdate(this.props.servers);
				
				if(this.props.current_server === server) {
					if(this.props.servers.length > 0) {
						let next_i = Math.max(0, server_index-1);
						this.props.onServerSelected( this.props.servers[next_i] );
					}
					else
						this.props.onServerSelected(null);
				}
				
				if(online) {
					this.setState({
						online_servers: this.state.online_servers-1
					});
				}
			}} key={`${server.ip}:${server.port}`} data={server} current={this.props.current_server === server} />;
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
				}} defaultValue={'30120'}/>
			</div>
			<button onClick={this.addServer.bind(this)}>OK</button>
			{this.state.add_server_error && <div className={'error'}>{this.state.add_server_error}</div>}
		</div>;
	}
	
	render() {
		return <div className={`settings-container${this.state.fade_settings ? ' fading' : ''}`}>
			<div className={'ripple'} style={{
				left: `${this.props.rippleX}px`,
				top: `${this.props.rippleY}px`
			}}/>
			<div className={'settings'}>
				<button className={'circle-btn closer'} onClick={this.close.bind(this)}>&times;</button>
				<div className={'servers-options'}>
					<label>{this.props.servers.length === 0 ? (this.state.add_server ?
						'' : 'Add server by clicking button below') :
						<span>
							Online: {this.state.online_servers}&nbsp;/&nbsp;{this.props.servers.length}
						</span>}
					</label>
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
}
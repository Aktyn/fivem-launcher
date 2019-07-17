import * as React from 'react';
import {ServerConfig} from "../common";

import '../styles/server_item.scss';

interface ServerItemProps {
	data: ServerConfig;
	current: boolean;
	onSelected: () => void;
}

export default class ServerItem extends React.Component<ServerItemProps, any> {
	
	constructor(props: ServerItemProps) {
		super(props);
	}
	
	render() {
		return <div className={`server-item${this.props.current ? ' current' : ''}`} onClick={this.props.onSelected}>
			<span>{this.props.data.ip}:{this.props.data.port}</span>
			<button className={'remove-btn'} />
		</div>;
	}
}
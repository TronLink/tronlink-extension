import React, { Component } from 'react';

import { ArrowLeftIcon } from 'components/Icons';

import Header from 'components/Header';

import SendHeader from 'components/Header/Send';
import SendContent from './SendView';

class Send extends Component {
	constructor(props) {
		super(props);

		this.state = {
			txToDataAddress: ''
		};
	}

	onSetAddress(e) {
		this.setState({
			txToDataAddress: e.target.value
		});
	}

	render() {
		return (
			<div class="mainContainer">
				<Header
					navbarTitle="CONFIRM TRX SEND"
					navbarLabel=""
					leftIcon={ true }
					leftIconImg={ <ArrowLeftIcon /> }
					leftIconRoute="/main/transactions"
					rightIcon={ false }
				>
					<SendHeader onSetAddress={ this.onSetAddress.bind(this) } />
				</Header>
				<div className="mainContent">
					<SendContent txToDataAddress={ this.state.txToDataAddress } />
                </div>
			</div>
		);
	}
}

export default Send;

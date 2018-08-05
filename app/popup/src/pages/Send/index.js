import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { CircleLoadingIcon, ArrowLeftIcon } from 'components/Icons';
import { popup } from 'index';

import Header from 'components/Header';
import AddressView from './AddressView';
import Logger from 'extension/logger';

import './Send.css';

const logger = new Logger('Send');

class Send extends Component {
    state = {
        mode: 'TRX',
        label: 'TRX',
        amount: 0,
        error: false,
        address: ''
    };

    onSetAddress(address) {
        this.setState({ address });
    }

    onRadioToggle({ target: { value: mode } }) {
        this.setState({ mode });
    }

    onAmountChange({ target: { value: amount } }) {
        this.setState({ amount });
    }

    renderTokens() {
        return Object.entries(this.props.account.tokens).map(([ tokenID, token ], index) => {
            const label = token.tokenAbbr || token.tokenName;

            return (
                <option value={ tokenID }>
                    { label }
                </option>
            );
        });
    }

    renderInput() {
        let token = (
            <div className="sendLabel">
                TRX
            </div>
        );

        if (this.state.mode === 'TOKEN') {
            if (Object.keys(this.props.account.tokens).length > 0) {
                token = (
                    <select>
                        { this.renderTokens() }
                    </select>
                );
            } else return (
                <div className="sendInputGroup">
                    No token balance to send.
                </div>
            );
        }

        return (
            <div className="sendInputGroup">
                <input
                    placeholder="Enter Amount to Send..."
                    className="textInput"
                    type="number"
                    value={ this.state.amount }
                    onChange={ event => this.onAmountChange(event) }
                    onFocus={ ({ target }) => target.select() }
                />
                { token }
            </div>
        );
    }

    cancelTransaction() {
        logger.info('User has cancelled transaction');
        this.props.history.push('/main/transactions');
    }

    sendTransaction() {
        logger.info(`User is requesting to send ${this.state.amount.toLocaleString()} TRX to ${this.state.address}`);

        this.setState({
            error: false,
            loading: true
        });        

        popup.requestSend(
            this.state.address, 
            this.state.amount * 1000000
        ).then(res => {
            logger.info('Send response', res);                   
        }).catch(error => {
            logger.error('Sending failed', error);

            this.setState({
                error,
                loading: false
            });
        });
    }

    checkLoading() {
        if (this.state.loading)
            return <div className="queueLoading"><CircleLoadingIcon /></div>;
    }

    checkError() {
        if (this.state.error)
            return <div className="queueError">{ this.state.error }</div>;
    }

    renderBody() {
        const totalUSD = (Math.floor(
            (this.props.price * (this.state.amount || 0)) * 100
        ) / 100).toLocaleString();

        return (
            <div className="send">
                { this.checkLoading() }
                { this.checkError() }
                <div className="sendRadioGroup">
                    <div className="sendRadioButton">
                        <input 
                            type="radio"
                            value={'TRX'}
                            onChange={ event => this.onRadioToggle(event) }
                            checked={ this.state.mode === 'TRX' }
                        /><span>TRX</span>
                    </div>
                    <div className="sendRadioButton">
                        { /*temp disabled*/ }
                        <input 
                            type="radio"
                            value={'TOKEN'}
                            onChange={ event => this.onRadioToggle(event) }
                            checked={ this.state.mode === 'TOKEN' }
                            disabled
                        /><span className="disabled">TOKEN</span>
                    </div>
                </div>
                { this.renderInput() }
                <div className="sendGroup">
                    <div className="sendGroupTop">
                        <div className="sendGroupHeader bold">Total</div>
                        <div className="sendGroupAmount bold orange">{ this.state.amount.toLocaleString() } { this.state.label }</div>
                    </div>
                </div>
                <div className="sendGroupDetail">
                    { totalUSD }
                    <span> USD</span>
                </div>
                <div className="sendGroup sendButtonContainer">
                    <div className="sendButton button outline" onClick={ () => this.cancelTransaction() }>
                        Cancel
                    </div>
                    <div className="sendButton button gradient" onClick={ () => this.sendTransaction() }>
                        Confirm
                    </div>
                </div>
            </div>
        );
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
					<AddressView onSetAddress={ address => this.onSetAddress(address) } />
				</Header>
				<div className="mainContent">
					{ this.renderBody() }
                </div>
			</div>
        );
    }
}

export default withRouter(
    connect(state => ({ 
        account: state.wallet.account,
        price: state.wallet.price 
    }))(Send)
);

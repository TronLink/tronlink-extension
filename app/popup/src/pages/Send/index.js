import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { SettingsIcon } from 'components/Icons';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { popup } from 'index';

import Utils from 'extension/utils';
import Header from 'components/Header';
import AddressView from './AddressView';
import Logger from 'extension/logger';
import Button from 'components/Button';

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
                    <FormattedMessage id='send.noTokens' />
                </div>
            );
        }

        return (
            <div className="sendInputGroup">
                <input
                    className="textInput"
                    type="text"
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
        logger.info(`User is requesting to send ${this.state.amount.toLocaleString()} ${this.state.label} to ${this.state.address}`);

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

    checkError() {
        if (this.state.error)
            return <div className="queueError">{ this.state.error }</div>;
    }

    isValid() {
        const { amount, address } = this.state;

        if(isNaN(amount))
            return false;

        if(amount <= 0)
            return false;

        if(this.mode === 'trx' && amount > (this.props.account.balance * 1000000))
            return false;

        if(this.mode === 'TOKEN' && amount > this.props.account.tokens[this.state.label])
            return false;

        if(!Utils.transformAddress(address))
            return false;

        return true;
    }

    renderBody() {
        const totalUSD = this.isValid() ? this.props.price * (this.state.amount || 0) : 0;
        const amount = this.isValid() ? this.state.amount : 0;

        return (
            <div className="send">
                { this.checkError() }
                { this.renderInput() }
                <div className="sendGroup">
                    <div className="sendGroupTop">
                        <div className="sendGroupHeader bold">
                            <FormattedMessage id='words.total' />
                        </div>
                        <div className="sendGroupAmount bold orange">
                            <FormattedMessage id='send.total' values={{ amount: this.state.amount, token: this.state.label }} />
                        </div>
                    </div>
                </div>
                <div className="sendGroupDetail">
                    Transaction Value: 
                    <span>
                        &nbsp;USD
                    </span>
                    <FormattedNumber value={ totalUSD } style='currency' currency='USD' minimumFractionDigits={ 0 } maximumFractionDigits={ 2 } />                    
                </div>
                <div className="sendGroup sendButtonContainer">
                    <Button onClick={ () => this.sendTransaction() } width={ '150px' } loading={ this.state.loading } disabled={ !this.isValid() }>
                        <FormattedMessage id='send.total' values={{ amount, token: this.state.label }} />
                    </Button>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div class="mainContainer">
				<Header
					navbarTitle="Send Funds"
					navbarLabel={ this.props.account.name || this.props.account.publicKey }
					rightIconImg={ <SettingsIcon /> }
                    rightIconRoute="/main/settings"
				/>
				<div className="mainContent">
                    <AddressView onSetAddress={ address => this.onSetAddress(address) } />
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

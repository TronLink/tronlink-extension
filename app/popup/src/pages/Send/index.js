import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { SettingsIcon, ArrowLeftIcon } from 'components/Icons';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { popup } from 'index';

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

    checkError() {
        if (this.state.error)
            return <div className="queueError">{ this.state.error }</div>;
    }

    renderBody() {
        const totalUSD = this.props.price * (this.state.amount || 0);

        return (
            <div className="send">
                { this.checkError() }
                <div className="sendRadioGroup">
                    <div className="sendRadioButton">
                        <input 
                            type="radio"
                            value={ 'TRX' }
                            onChange={ event => this.onRadioToggle(event) }
                            checked={ this.state.mode === 'TRX' }
                            readOnly={ this.state.loading }
                        />
                        <span>
                            TRX
                        </span>
                    </div>
                    <div className="sendRadioButton">
                        { /*temp disabled*/ }
                        <input 
                            type="radio"
                            value={ 'TOKEN' }
                            onChange={ event => this.onRadioToggle(event) }
                            checked={ this.state.mode === 'TOKEN' }
                            disabled
                        />
                        <span className="disabled">
                            <FormattedMessage id='words.token' />
                        </span>
                    </div>
                </div>
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
                    <FormattedNumber value={ totalUSD } style='currency' currency='USD' minimumFractionDigits={ 0 } maximumFractionDigits={ 2 } />
                    <span>
                        &nbsp;USD
                    </span>
                </div>
                <div className="sendGroup sendButtonContainer">
                    <Button onClick={ () => this.cancelTransaction() } width={ '150px' } type={ 'secondary' } disabled={ this.state.loading }>
                        <FormattedMessage id='words.cancel' />
                    </Button>
                    <Button onClick={ () => this.sendTransaction() } width={ '150px' } loading={ this.state.loading }>
                        <FormattedMessage id='words.confirm' />
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

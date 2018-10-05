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
import Dropdown from 'react-dropdown';

import 'react-dropdown/style.css';
import './Send.css';

const logger = new Logger('Send');

class Send extends Component {
    state = {
        token: {
            value: false,
            label: 'TRX'
        },
        amount: 0,
        error: false,
        loading: false,
        address: ''
    };

    onAddressChange(address) {
        this.setState({ address });
    }

    onAmountChange({ target: { value: amount } }) {
        this.setState({ amount });
    }

    setToken(token) {
        logger.info(`Setting token to -> ${ token.value }`);

        this.setState({
            token
        });
    }

    tokensDropdown() {
        const tokens = [ {
            value: false,
            label: 'TRX'
        }, ...Object.entries(this.props.account.tokens).map(([ tokenID ]) => ({
            value: tokenID,
            className: 'isToken',
            label: (<React.Fragment>
                { tokenID } <span className='tokenLabel trx10'>token</span>
            </React.Fragment>)
        })) ];

        return (
            <Dropdown
                disabled={ this.state.loading }
                value={ this.state.token }
                options={ tokens }
                className='send-dropdown'
                controlClassName='send-dropdown--control'
                menuClassName='send-dropdown--menu'
                arrowClassName='send-dropdown--arrow'
                onChange={ token => this.setToken(token) } />
        );
    }

    sendTransaction() {
        const {
            value: tokenID,
            label: tokenLabel
        } = this.state.token;

        const isTRX = tokenID === false;

        logger.info(`User is requesting to send ${this.state.amount.toLocaleString()} ${tokenLabel} to ${this.state.address}`);

        this.setState({
            error: false,
            loading: true
        });

        const func = isTRX ?
            popup.requestSend(this.state.address, this.state.amount * 1000000) :
            popup.requestSendToken(this.state.address, this.state.amount, tokenID);

        return func.then(res => {
            logger.info('Send response', res);                   
        }).catch(error => {
            logger.error('Sending failed', error);

            this.setState({
                error,
                loading: false
            });
        });
    }

    isValid() {
        const { 
            amount, 
            address,
            token
        } = this.state;

        const isTRX = token.value === false;

        if(isNaN(amount))
            return false;

        if(amount <= 0)
            return false;

        if(isTRX && amount > (this.props.account.balance * 1000000))
            return false;

        if(!isTRX && amount > this.props.account.tokens[token.value])
            return false;

        if(!Utils.transformAddress(address))
            return false;

        return true;
    }

    renderBody() {
        const totalUSD = this.isValid() ? this.props.price * (this.state.amount || 0) : 0;
        const amount = this.isValid() ? this.state.amount : 0;
        const isTRX = this.state.token.value === false;

        return (
            <div className='send'>
                { this.state.error && <div className='queueError'>{ this.state.error }</div> }
                <div className='tokenInputGroup'>
                    <input
                        className='tokenInput'
                        type='text'
                        value={ this.state.amount }
                        disabled={ this.state.loading }
                        onChange={ event => this.onAmountChange(event) }
                        onFocus={ ({ target }) => target.select() }
                    />
                    { this.tokensDropdown() }
                </div>
                <div className='sendGroup'>
                    <div className='sendGroupTop'>
                        <div className='sendGroupHeader bold'>
                            <FormattedMessage id='words.total' />
                        </div>
                        <div className='sendGroupAmount bold orange'>
                            <FormattedMessage id='send.total' values={{ amount: this.state.amount, token: this.state.token.value }} />
                        </div>
                    </div>
                </div>
                { isTRX && <div className='sendGroupDetail'>
                    Transaction Value: 
                    <span>
                        &nbsp;USD
                    </span>
                    <FormattedNumber value={ totalUSD } style='currency' currency='USD' minimumFractionDigits={ 0 } maximumFractionDigits={ 2 } />                    
                </div> }
                <div className='sendGroup sendButtonContainer'>
                    <Button onClick={ () => this.sendTransaction() } width={ '150px' } loading={ this.state.loading } disabled={ !this.isValid() }>
                        <FormattedMessage id='send.total' values={{ amount, token: this.state.token.value || 'TRX' }} />
                    </Button>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div class='mainContainer'>
				<Header
					navbarTitle='Send Funds'
					navbarLabel={ this.props.account.name || this.props.account.publicKey }
					rightIconImg={ <SettingsIcon /> }
                    rightIconRoute='/main/settings'
				/>
				<div className='mainContent'>
                    <AddressView onSetAddress={ address => this.onAddressChange(address) } disabled={ this.state.loading } />
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

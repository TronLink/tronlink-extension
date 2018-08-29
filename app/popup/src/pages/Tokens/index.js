import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { SettingsIcon } from 'components/Icons';
import { popup } from 'index';

import Header from 'components/Header';

import './Tokens.css';

class Tokens extends Component {
    componentDidMount() {
        if(!this.props.account)
            return;

        if(this.props.account == undefined)
            return;

        if(!this.props.account.publicKey)
            return;

        popup.updateAccount(this.props.account.publicKey);
    }

    render() {
        const { tokens } = this.props.account;

        const tokenList = Object.entries(tokens).map(([ token, balance ], index) => (
            <div className='token' key={ index }>
                <div className='tokenName'>{ token }</div>
                <div className='tokenAmount'>{ balance }</div>
            </div>
        ));

        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle={ 'Token Balances' }
                    navbarLabel={ this.props.account.name || this.props.account.publicKey }
                    rightIconImg={ <SettingsIcon /> }
                    rightIconRoute="/main/settings"
                />
                <div className="mainContent">
                    <div className="tokensView">
                        { !tokenList.length && <div className='tokensEmpty'>
                            <FormattedMessage id='tokens.noTokens' />
                        </div> }
                        { tokenList }
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    account: state.wallet.account
}))(Tokens);

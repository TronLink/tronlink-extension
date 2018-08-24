import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { SettingsIcon } from 'components/Icons';
import { popup } from 'index';
import { getAccounts } from 'reducers/wallet';

import Swal from 'sweetalert2';
import Header from 'components/Header';

import './Accounts.css';

class Accounts extends Component {
    constructor(props) {
        super(props);
        this.translate = props.intl.formatMessage;
    }

    componentDidMount() {
        getAccounts();
    }

    async createAccount() {
        // Check for bip44 account gap (20 empty accounts)
        const emptyAccounts = 
            Object.values(this.props.accounts)
                .filter(account => account.internal && !account.transactions.length)
                .sort((a, b) => b.accountIndex - a.accountIndex);

        if(emptyAccounts.length >= 2 && (emptyAccounts[0].accountIndex - 20 >= emptyAccounts[emptyAccounts.length - 2].accountIndex)) {
            return Swal({
                title: this.translate({ id: 'accounts.create.tooMany' }),
                type: 'error'
            });
        }

        const { value: name } = await Swal({
            title: this.translate({ id: 'accounts.create.title' }),
            input: 'text',
            inputPlaceholder: this.translate({ id: 'accounts.create.placeholder' }),
            showCancelButton: true,
            inputValidator: name => {
                if(!name)
                    return this.translate({ id: 'accounts.create.requiresName' });

                if(name.trim().length > 32)
                    return this.translate({ id: 'accounts.create.nameTooLong' })

                if(Object.values(this.props.accounts).some(account => account.name == name.trim()))
                    return this.translate({ id: 'accounts.create.nameTaken' });

                return false;
            }
        });
        
        if(!name)
            return;
            
        popup.createAccount(name);
        getAccounts();
    }

    importAccount() {
        // TODO: Go to import page (full screen with header hideNav={ true })
    }

    async deleteAccount() {
        if(Object.keys(this.props.accounts).length === 1)
            return;

        const { value } = await Swal({
            title: this.translate({ id: 'accounts.delete.title' }),
            text: this.translate({ id: 'accounts.delete.text' }),
            showCancelButton: true,
            confirmButtonText: this.translate({ id: 'accounts.delete.button' })
        });

        if(value) {
            popup.deleteAccount(this.props.account.publicKey);
            getAccounts();
        }
    }

    renderButtons() {
        const accounts = Object.keys(this.props.accounts).length;

        return (
            <div className='buttons'>
                <div className='button' onClick={ () => this.createAccount() }>
                    <FormattedMessage id='accounts.button.create' />
                </div>
                <div className='button disabled' onClick={ () => this.importAccount() }>
                    <FormattedMessage id='accounts.button.import' />
                </div>
                <div className={ 'button ' + ( accounts === 1 ? 'disabled' : '' ) } onClick={ () => ( accounts > 1 ) && this.deleteAccount() }>
                    <FormattedMessage id='accounts.button.delete' />
                </div>
            </div>
        );
    }

    selectAccount(publicKey) {
        popup.selectAccount(publicKey);
    }

    renderAccounts() {
        const {
            account: activeAccount,
            accounts
        } = this.props;

        return Object.entries(accounts).map(([ publicKey, account ]) => {
            const isSuperRepresentative = false;
            const hasDeployedSmartContract = false;
            const isActiveAccount = activeAccount.publicKey === publicKey;

            return (
                <div className={ 'account ' + ( isActiveAccount ? 'active' : '' ) } onClick={ () => !isActiveAccount && this.selectAccount(publicKey) }>
                    <div className='accountDetails'>
                        <div className='accountDetailsHeader'>
                            { account.name && <span className='accountName'>
                                { account.name }
                            </span> }
                            <span className='accountAddress'>
                                { publicKey }
                            </span>
                        </div>
                        <div className='accountBalances'>
                            <span className='accountTrx'>
                                <FormattedMessage id='accounts.balance.trx' values={{ amount: account.balance / 1000000 }} />
                            </span>
                            <span className='accountTokens'>
                                <FormattedMessage id='accounts.balance.tokens' values={{ amount: Object.keys(account.tokens).length }} />
                            </span>
                        </div>
                        <div className='accountMeta'>
                            <span className={ 'meta ' + ( isSuperRepresentative ? 'has-meta' : 'no-meta'  ) }>
                                <FormattedMessage id='accounts.meta.superRepresentative' />
                            </span>
                            <span className={ 'meta ' + ( hasDeployedSmartContract ? 'has-meta' : 'no-meta'  ) }>
                                <FormattedMessage id='accounts.meta.smartContract' />
                            </span>
                        </div>
                    </div>
                    <div className={ 'accountSelector ' + ( isActiveAccount ? 'active' : '' ) }></div>  
                </div>
            );
        });
    }

    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle={ 'Accounts' }
                    navbarLabel={ this.props.account.name || this.props.account.publicKey }
                    rightIconImg={ <SettingsIcon /> }
                    rightIconRoute="/main/settings"
                />
                <div className="mainContent">
                    <div className="accountList">
                        { this.renderButtons() }
                        { this.renderAccounts() }
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(
    connect(state => ({
        accounts: state.wallet.accounts,
        account: state.wallet.account
    }))(Accounts)
);

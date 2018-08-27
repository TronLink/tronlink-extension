import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { ArrowLeftIcon } from 'components/Icons';
import { popup } from 'index';
import { ACCOUNT_TYPE } from 'extension/constants';
import { connect } from 'react-redux';

import Utils from 'extension/Utils';
import Swal from 'sweetalert2';
import Header from 'components/Header';
import Button from 'components/Button';
import CreateSuccess from 'components/CreateSuccess';
import wordList from 'extension/wordList.json';
import bip39 from 'bip39';

class MnemonicPhrase extends Component {
    state = {
        showImportSuccess: false,
        loading: false,
        wordList: ''
    }

    constructor(props) {
        super(props);
        this.translate = props.intl.formatMessage;
    }

    async import() {
        // This shouldn't happen, but a failsafe for if it does
        if(this.hasInvalidWords())
            return;

        this.setState({ 
            loading: true
        });

        const words = this.state.wordList;
        const privateKey = bip39.mnemonicToSeedHex(words);
        const publicKey = Utils.privateKeyToAddress(privateKey);

        if(Object.keys(this.props.accounts).includes(publicKey)) {
            return Swal({
                type: 'error',
                title: 'Account already exists',
                text: 'The account you have tried to import already exists'
            });
        }

        const { value: name } = await Swal({
            title: this.translate({ id: 'accounts.import.title' }),
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
        
        if(!name) {
            return this.setState({ 
                loading: false
            });
        }

        const accounts = await popup.importAccount(ACCOUNT_TYPE.MNEMONIC, words, name);

        this.setState({
            showImportSuccess: {
                onAcknowledged: () => {
                    this.props.history.push('/main/accounts')
                },
                accountName: name,
                imported: true
            },
            loading: false
        });        
    }

    hasInvalidWords() {
        return !bip39.validateMnemonic(this.state.wordList);
    }

    handleChange({ target: { value: wordList }}) {
        this.setState({ wordList });
    }

    render() {
        if(this.state.showImportSuccess)
            return <CreateSuccess { ...this.state.showImportSuccess } />;

        return (
            <React.Fragment>
                <Header 
                    navbarTitle={ 'Import Account' }
                    navbarLabel={ 'Import account from Mnemonic Phrase' }
                    leftIconImg={ this.state.loading ? false : <ArrowLeftIcon /> }
                    leftIconRoute='/main/import'
                    hideNav={ true }
                />
                <div className='import'>
                    <div className="importText">Enter your list of 24 words below</div>
                    <textarea
                        placeholder="Mnemonic phrase"
                        className="textAreaImport"
                        rows={ 5 }
                        value={ this.state.wordList }
                        onChange={ event => this.handleChange(event) }
                        disabled={ this.state.loading }
                    />
                    <Button 
                        type={ 'black' } 
                        style={{ marginTop: '20px' }} 
                        loading={ this.state.loading } 
                        disabled={ this.hasInvalidWords() } 
                        onClick={ () => this.import() }
                    >
                        <FormattedMessage id='import.button' />
                    </Button>
                </div>
            </React.Fragment>
        );
    }
}

export default injectIntl(
    connect(state => ({
        accounts: state.wallet.accounts,
    }))(MnemonicPhrase)
);
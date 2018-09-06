import React, { Component } from 'react'
import { injectIntl, FormattedMessage } from 'react-intl';
import { ArrowLeftIcon } from 'components/Icons';
import { popup } from 'index';
import { ACCOUNT_TYPE } from 'extension/constants';
import { connect } from 'react-redux';

import Utils from 'extension/utils';
import Swal from 'sweetalert2';
import Header from 'components/Header';
import Button from 'components/Button';
import CreateSuccess from 'components/CreateSuccess';
import wordList from 'extension/wordList.json';
import bip39 from 'bip39';

import './TronWatch.css';

class TronWatch extends Component {
    state = {
        showImportSuccess: false,
        words: new Array(24).fill('')
    }

    constructor(props) {
        super(props);
        this.translate = props.intl.formatMessage;
    }
    
    async import() {
        // This shouldn't happen, but a failsafe for if it does
        if(this.hasInvalidWords())
            return;

        const words = this.state.words.join(' ');
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
        
        if(!name)
            return;

        await popup.importAccount(ACCOUNT_TYPE.RAW, privateKey, name);

        this.setState({
            showImportSuccess: {
                onAcknowledged: () => {
                    this.props.history.push('/main/accounts')
                },
                accountName: name,
                imported: true
            }
        });        
    }

    hasInvalidWords() {
        return this.state.words.some(word => !word.length || !wordList.includes(word));
    }

    handleWordChange(word, index) {
        const lowerCaseWord = word.toLowerCase().replace(/[^a-z]/g, '');

        const { words } = this.state;
        words[index] = lowerCaseWord;

        this.setState({
            words
        });
    }

    renderInputs() {
        return new Array(12).fill(0).map((_, x) => {
            const inputs = [ 0, 12 ].map(y => {
                const index = x + y;
                const word = this.state.words[index];

                return (
                    <input
                        type='text'
                        value={ word }
                        placeholder={ `Word ${index + 1}` }
                        key={ index }
                        onChange={ ({ target: { value } }) => this.handleWordChange(value, index) }
                        className={ wordList.includes(word) ? 'valid' : 'invalid' }
                        tabIndex={ index + 2 } />
                );
            });

            return (
                <div className='input-row' key={ x }>
                    { inputs }
                </div>
            );
        });
    }

    render() {
        if(this.state.showImportSuccess)
            return <CreateSuccess { ...this.state.showImportSuccess } />;

        return (
            <React.Fragment>
                <Header 
                    navbarTitle={ 'Import Account' }
                    navbarLabel={ 'Import account from TronWatch' }
                    leftIconImg={ <ArrowLeftIcon /> }
                    leftIconRoute='/main/import'
                    hideNav={ true }
                /> 
                <div className='import tronWatch'>
                    <div className="importText">Enter your 24 word backup phrase from TronWatch below</div>
                    <div className="inputContainer">
                        { this.renderInputs() }
                    </div>
                    <Button type={ 'black' } disabled={ this.hasInvalidWords() } onClick={ () => this.import() }>
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
    }))(TronWatch)
);

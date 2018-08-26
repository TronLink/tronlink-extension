import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl';
import { ArrowLeftIcon } from 'components/Icons';
import { popup } from 'index';
import { getAccounts } from 'reducers/wallet';
import { IMPORT_TYPE } from 'extension/constants';

import Swal from 'sweetalert2';
import Header from 'components/Header';
import Button from 'components/Button';
import CreateSuccess from 'components/CreateSuccess';
import wordList from './wordList.json';

import './TronWatch.css';

class TronWatch extends Component {
    state = {
        words: new Array(24).fill('')
    }
    
    import() {
        // This shouldn't happen, but a failsafe for if it does
        if(this.hasInvalidWords())
            return;

        // do swal
        // await popup.importAccount(IMPORT_TYPE.TRON_WATCH, words.join(' '))
        // should return { error } or { account }
        // if hasOwnProperty(error) then disable error in Swal error dialog
        // else show CreateSuccess page, import={ true }, render privateKey only
        // it won't have mnemonic in the account response because
        // it has been converted to just a privateKey

        // for IMPORT_TYPE.TRON_SCAN we need an input element on the page
        // we can just try decrypting on the fly to show if the password
        // is valid or not, and only allow importing the account (button enabled)
        // when password is correct for the keystore (trim the keystore input)
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

export default TronWatch;
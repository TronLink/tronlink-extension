import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { ArrowLeftIcon } from 'components/Icons';

import Header from 'components/Header';
import Button from 'components/Button';

class MnemonicPhrase extends Component {
    state = {
        wordList: ''
    }

    handleChange({ target: { value: wordList }}) {
        this.setState({ wordList });
    }

    render() {
        return (
            <React.Fragment>
                <Header 
                    navbarTitle={ 'Import Account' }
                    navbarLabel={ 'Import account from Mnemonic Phrase' }
                    leftIconImg={ <ArrowLeftIcon /> }
                    leftIconRoute='/main/import'
                    hideNav={ true }
                />
                <div className='import'>
                    <div className="importText">Enter your list of 24 words below</div>
                    <textarea
                        placeholder="Mnemonic phrase"
                        className="textAreaImport"
                        rows={ 5 }
                        value={ this.state.privateKey }
                        onChange={ event => this.handleChange(event) }
                    />
                    <Button type={ 'black' } style={{ marginTop: '20px' }}>
                        <FormattedMessage id='import.button' />
                    </Button>
                </div>
            </React.Fragment>
        );
    }
}

export default MnemonicPhrase;
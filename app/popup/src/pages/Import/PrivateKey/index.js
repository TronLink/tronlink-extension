import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { ArrowLeftIcon } from 'components/Icons';

import Header from 'components/Header';
import Button from 'components/Button';

import './PrivateKey.css';

class PrivateKey extends Component {
    state = {
        privateKey: ''
    }

    handlePrivateKeyChange({ target: { value: privateKey }}) {
        this.setState({ privateKey });
    }

    render() {
        return (
            <React.Fragment>
                <Header 
                    navbarTitle={ 'Import Account' }
                    navbarLabel={ 'Import account from Private Key' }
                    leftIconImg={ <ArrowLeftIcon /> }
                    leftIconRoute='/main/import'
                    hideNav={ true }
                />
                <div className='import'>
                    <div className="importText">
                        Enter your private key below
                    </div>
                    <input 
                        placeholder="Private key"
                        className="textInput"
                        type="text"
                        value={ this.state.privateKey }
                        onChange={ event => this.handlePrivateKeyChange(event) }
                    />
                    <Button type={ 'black' } style={{ marginTop: '20px' }}>
                        <FormattedMessage id='import.button' />
                    </Button>
                </div>
            </React.Fragment>
        );
    }
}

export default PrivateKey;
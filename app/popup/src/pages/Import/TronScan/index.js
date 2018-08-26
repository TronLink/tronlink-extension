import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { ArrowLeftIcon } from 'components/Icons';

import Header from 'components/Header';
import Button from 'components/Button';

class TronScan extends Component {
    state = {
        keyStore: ''
    }

    handleChange({ target: { value: keyStore }}) {
        this.setState({ keyStore });
    }

    render() {
        return (
            <React.Fragment>
                <Header 
                    navbarTitle={ 'Import Account' }
                    navbarLabel={ 'Import account from TronScan' }
                    leftIconImg={ <ArrowLeftIcon /> }
                    leftIconRoute='/main/import'
                    hideNav={ true }
                />
                <div className='import'>
                    <div className="importText">Paste the contents from your KeyStore file below</div>
                    <textarea
                        placeholder="Keystore file"
                        className="textAreaImport"
                        rows={ 13 }
                        value={ this.state.keyStore }
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

export default TronScan;
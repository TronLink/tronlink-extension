import React, { Component } from 'react';
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

import './PrivateKey.css';

class PrivateKey extends Component {
    state = {
        showImportSuccess: false,
        privateKey: '',
        validKey: false
    }

    constructor(props) {
        super(props);
        this.translate = props.intl.formatMessage;
    }

    handleChange({ target: { value: privateKey }}) {
        let validKey = false;

        try {
            const publicKey = Utils.privateKeyToAddress(privateKey);
            validKey = Utils.transformAddress(publicKey);
        } catch (ex) {
            validKey = false;
        }

        this.setState({ 
            privateKey,
            validKey
        });
    }

    async import() {
        // This shouldn't happen, but a failsafe for if it does
        if(!Utils.isHex(this.state.privateKey))
            return;

        const { privateKey } = this.state;
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

    render() {
        if(this.state.showImportSuccess)
            return <CreateSuccess { ...this.state.showImportSuccess } />;
            
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
                    <textarea
                        placeholder="Private key"
                        className="textAreaImport"
                        rows={ 4 }
                        value={ this.state.privateKey }
                        onChange={ event => this.handleChange(event) }
                    />
                    <Button type={ 'black' } style={{ marginTop: '20px' }} disabled={ !this.state.validKey } onClick={ () => this.import() }>
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
    }))(PrivateKey)
);
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
import Dropzone from 'react-dropzone'
import pbkdf2 from 'pbkdf2';
import AesJS from 'aes-js';
import ByteArray from 'extension/ByteArray';

import './TronScan.css';

class TronScan extends Component {
    state = {
        showImportSuccess: false,
        privateKey: false,
        password: '',        
        keyStore: ''
    }

    constructor(props) {
        super(props);
        this.translate = props.intl.formatMessage;
    }

    handleChange({ target: { value: password }}) {
        this.setState({
            password
        }, () => this.checkPassword());
    }

    checkPassword() {
        const privateKey = this.decryptKeyStore();

        this.setState({
            privateKey
        });
    }

    encryptKey(password, salt) {
        return pbkdf2.pbkdf2Sync(password, salt, 1, 256 / 8, 'sha512');
    }

    decryptString(password, salt, hexString) {
        const key = this.encryptKey(password, salt);

        const encryptedBytes = AesJS.utils.hex.toBytes(hexString);
        const aesCtr = new AesJS.ModeOfOperation.ctr(key);
        const decryptedBytes = aesCtr.decrypt(encryptedBytes);

        return AesJS.utils.utf8.fromBytes(decryptedBytes);
    }

    decryptKeyStore() {
        const keyStore = this.state.keyStore.trim();
        const password = this.state.password.trim();

        if(!keyStore.length || !password.length)
            return false;

        try {
            const {
                key: encryptedPrivateKey,
                address,
                salt,
                version
            } = JSON.parse(
                Buffer.from(keyStore, 'hex').toString('utf8')
            );

            if(version !== 1) {
                Swal({
                    type: 'error',
                    title: 'Invalid TronScan KeyStore',
                    text: 'TronLink only supports version 1 of the TronScan KeyStore'
                });

                return false;
            }

            const privateKey = this.decryptString(password, salt, encryptedPrivateKey);
            const publicKey = Utils.privateKeyToAddress(privateKey);

            return publicKey === address ? privateKey : false;
        } catch (ex) {
            return false;
        }
    }

    onKeyStoreUpload([ file ]) {
        const fileReader = new FileReader();

        fileReader.onload = ({ target: { result }}) => {
            this.setState({
                keyStore: result
            }, () => this.checkPassword());
        }

        fileReader.onerror = () => {
            Swal({
                type: 'error',
                title: 'Failed to upload KeyStore'
            });
        }

        fileReader.readAsText(file);
    }

    async import() {
        if(!this.state.privateKey)
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
                    navbarLabel={ 'Import account from TronScan' }
                    leftIconImg={ <ArrowLeftIcon /> }
                    leftIconRoute='/main/import'
                    hideNav={ true }
                />
                <div className='import'>
                    <div className="importText">Upload your KeyStore file below</div>
                    <input
                        placeholder='Enter account password'
                        className={ 'textInput tronScan ' + (this.state.privateKey ? 'valid' : 'invalid') }
                        type='password'
                        value={ this.state.password }
                        onChange={ event => this.handleChange(event) }
                    />
                    <Dropzone
                        className={ 'fileUpload' }
                        maxSize={ 2000 }
                        multiple={ false }
                        accept={ 'text/plain' }
                        onDropAccepted={ file => this.onKeyStoreUpload(file) }
                    >
                        <textarea
                            placeholder="Click to upload Keystore file"
                            className="textAreaImport"
                            rows={ 8 }
                            value={ this.state.keyStore }
                            readOnly={ true }
                        />
                    </Dropzone>
                    <Button type={ 'black' } style={{ marginTop: '20px' }} disabled={ !this.state.privateKey } onClick={ () => this.import() }>
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
    }))(TronScan)
);
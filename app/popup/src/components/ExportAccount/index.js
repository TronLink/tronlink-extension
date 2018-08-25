import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from 'components/Button';

import './ExportAccount.css';

export default class ExportAccount extends React.Component {
    renderMnemonic() {
        const {
            accountName,
            mnemonic
        } = this.props;

        return (
            <React.Fragment>
                <div className='exportBody'>
                    Your account <strong>{ accountName }</strong> was created with a mnemonic phrase.
                    This means that you only have to write down the <strong>mnemonic phrase</strong> below
                </div>
                <div className='backupPhrase'>
                    <span className='backupTag'>
                        Mnemonic Phrase
                    </span>
                    { mnemonic }
                </div>
            </React.Fragment>
        );
    }

    renderRaw() {
        const {
            accountName
        } = this.props;

        return (
            <React.Fragment>
                <div className='exportBody'>
                    Your account <strong>{ accountName }</strong> was imported from a private key.
                    This means that you can only export the <strong>private key</strong>, and not a mnemonic phrase
                </div>
                <div className='backupBody'>
                    Write down your private key now. This will prevent unwanted loss of funds in the future
                </div>
            </React.Fragment>
        );
    }

    render() {
        const {
            mnemonic,
            privateKey
        } = this.props;

        return (
            <div className='exportPage'>
                <div className='exportTitle'>
                    Export Account
                </div>
                { mnemonic ? this.renderMnemonic() : this.renderRaw() }
                <div className='backupPhrase'>
                    <span className='backupTag'>
                        Private Key
                    </span>
                    { privateKey }
                </div>
                <Button className='successButton' onClick={ () => this.props.onAcknowledged() }>
                    Go to Wallet
                </Button>
            </div>
        ); 
    }
}
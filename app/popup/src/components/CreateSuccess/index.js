import React from 'react';
import { FormattedMessage } from 'react-intl';

import Lottie from 'react-lottie';
import Button from 'components/Button';

import * as checkmark from './checkmark.json';
import './CreateSuccess.css';

export default class CreateSuccess extends React.Component {
    animationOptions = {
        loop: false,
        autoplay: true,
        animationData: checkmark,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    render() {
        const {
            accountName,
            imported,
            mnemonic
        } = this.props;

        return (
            <div className='successPage'>
                <Lottie options={ this.animationOptions } height={ 138 } width={ 350 } />
                <div className='successTitle'>
                    Success!
                </div>
                <div className='successBody'>
                    Your account <strong>{ accountName }</strong> has been { imported ? 'imported' : 'created' } successfully
                </div>
                { !imported && <div className='backupBody'>
                    Write down your backup phrase now. This will prevent unwanted loss of funds in the future
                </div> }
                { !imported && <div className='backupPhrase'>
                    { mnemonic }
                </div> }
                <Button className='successButton' onClick={ () => this.props.onAcknowledged() }>
                    Go to Wallet
                </Button>
            </div>
        ); 
    }
}
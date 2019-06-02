import React from 'react';
import AccountName from 'components/AccountName';

import { PopupAPI } from '@tronlink/lib/api';
import { RESTORATION_STAGE } from '@tronlink/lib/constants';

import ChoosingType from './stages/ChoosingType';
import MnemonicImport from './stages/MnemonicImport';
import PrivateKeyImport from './stages/PrivateKeyImport';
import KeystoreImport from './stages/KeystoreImport';

import './RestoreAccountController.scss';

class RestoreAccountController extends React.Component {
    state = {
        stage: RESTORATION_STAGE.SETTING_NAME,
        walletName: false
    };

    constructor() {
        super();

        this.handleNameSubmit = this.handleNameSubmit.bind(this);
        this.changeStage = this.changeStage.bind(this);
    }

    handleNameSubmit(name) {
        this.setState({
            stage: RESTORATION_STAGE.CHOOSING_TYPE,
            walletName: name.trim()
        });
    }

    changeStage(newStage) {
        console.log(newStage);
        this.setState({
            stage: newStage
        });
    }

    render() {
        const {
            stage,
            walletName
        } = this.state;
        switch(stage) {
            case RESTORATION_STAGE.SETTING_NAME:
                return (
                    <AccountName
                        onSubmit={ this.handleNameSubmit }
                        onCancel={ () => PopupAPI.resetState() }
                    />
                );
            case RESTORATION_STAGE.CHOOSING_TYPE:
                return (
                    <ChoosingType
                        onSubmit={ importType => this.changeStage(importType) }
                        onCancel={ () => this.changeStage(RESTORATION_STAGE.SETTING_NAME) }
                    />
                );
            case RESTORATION_STAGE.IMPORT_PRIVATE_KEY:
                return (
                    <PrivateKeyImport
                        name={ walletName }
                        onCancel={ () => this.changeStage(RESTORATION_STAGE.CHOOSING_TYPE) }
                    />
                );
            case RESTORATION_STAGE.IMPORT_MNEMONIC:
                return (
                    <MnemonicImport
                        name={ walletName }
                        onCancel={ () => this.changeStage(RESTORATION_STAGE.CHOOSING_TYPE) }
                    />
                );
            case RESTORATION_STAGE.IMPORT_KEY_STORE:
                return (
                    <KeystoreImport
                        name={ walletName }
                        onCancel={ () => this.changeStage(RESTORATION_STAGE.CHOOSING_TYPE) }
                    />
                );    
            default:
                return null;
        }
    }
}

export default RestoreAccountController;

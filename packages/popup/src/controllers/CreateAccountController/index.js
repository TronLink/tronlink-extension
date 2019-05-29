import React from 'react';
import AccountName from 'components/AccountName';
import Utils from '@tronlink/lib/utils';
import Lottie from 'react-lottie';

import { PopupAPI } from '@tronlink/lib/api';
import { CREATION_STAGE } from '@tronlink/lib/constants';

import WritingPhrase from './stages/WritingPhrase';
import ConfirmingPhrase from './stages/ConfirmingPhrase';

import * as checkmark from '@tronlink/popup/src/assets/animations/checkmark.json';

class CreateAccountController extends React.Component {
    animationOptions = {
        loop: false,
        autoplay: true,
        animationData: checkmark,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    state = {
        stage: CREATION_STAGE.SETTING_NAME,
        walletName: false
    };

    constructor() {
        super();

        this.mnemonic = Utils.generateMnemonic();
        this.handleNameSubmit = this.handleNameSubmit.bind(this);
        this.changeStage = this.changeStage.bind(this);
    }

    handleNameSubmit(name) {
        this.setState({
            stage: CREATION_STAGE.WRITING_PHRASE,
            walletName: name.trim()
        });
    }

    async changeStage(newStage) {
        // This call intentionally doesn't update appState
        if(newStage === CREATION_STAGE.SUCCESS) {
            await PopupAPI.addAccount(
                this.mnemonic,
                this.state.walletName
            );

            // This is temp until we have a success component
            PopupAPI.resetState();
        }

        this.setState({
            stage: newStage
        });
        return true;
    }

    render() {
        const { stage } = this.state;

        switch(stage) {
            case CREATION_STAGE.SETTING_NAME:
                return (
                    <AccountName
                        onSubmit={ this.handleNameSubmit }
                        onCancel={ () => PopupAPI.resetState() }
                    />
                );
            case CREATION_STAGE.WRITING_PHRASE:
                return (
                    <WritingPhrase
                        mnemonic={ this.mnemonic }
                        onSubmit={ () => this.changeStage(CREATION_STAGE.CONFIRMING_PHRASE) }
                        onCancel={ () => this.changeStage(CREATION_STAGE.SETTING_NAME) }
                    />
                );
            case CREATION_STAGE.CONFIRMING_PHRASE:
                return (
                    <ConfirmingPhrase
                        mnemonic={ this.mnemonic }
                        onSubmit={ () => this.changeStage(CREATION_STAGE.SUCCESS) }
                        onCancel={ () => this.changeStage(CREATION_STAGE.WRITING_PHRASE) }
                    />
                );
            default:
                return <Lottie options={ this.animationOptions } height={ 138 } width={ 350 } />;
        }
    }
}

export default CreateAccountController;

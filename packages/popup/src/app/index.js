import React from 'react';

import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';

import { APP_STATE } from '@tronlink/lib/constants';

import RegistrationController from '@tronlink/popup/src/controllers/RegistrationController';
import LoginController from '@tronlink/popup/src/controllers/LoginController';
import WalletCreationController from '@tronlink/popup/src/controllers/WalletCreationController';
import CreateAccountController from '@tronlink/popup/src/controllers/CreateAccountController';
import RestoreAccountController from '@tronlink/popup/src/controllers/RestoreAccountController';
import PageController from '@tronlink/popup/src/controllers/PageController';
import ConfirmationController from '@tronlink/popup/src/controllers/ConfirmationController';
import ReceiveController from '@tronlink/popup/src/controllers/ReceiveController';
import SendController from '@tronlink/popup/src/controllers/SendController';
import TransactionsController from '@tronlink/popup/src/controllers/TransactionsController';

import 'react-custom-scroll/dist/customScroll.css';
import 'assets/styles/global.scss';

class App extends React.Component {
    render() {
        const { appState,accounts } = this.props;
        console.log(appState,accounts,'~~~~~~~~~~~~');
        switch(appState) {
            case APP_STATE.UNINITIALISED:
                return <RegistrationController />;
            case APP_STATE.PASSWORD_SET:
                return <LoginController />;
            case APP_STATE.UNLOCKED:
                return <WalletCreationController />;
            case APP_STATE.CREATING:
                return <CreateAccountController />;
            case APP_STATE.RESTORING:
                return <RestoreAccountController />;
            case APP_STATE.READY:
                return <PageController />;
            case APP_STATE.REQUESTING_CONFIRMATION:
                return <ConfirmationController />;
            case APP_STATE.RECEIVE:
                return <ReceiveController address={accounts.selected.address} onCancel={ ()=>PopupAPI.changeState(APP_STATE.READY) } />;
            case APP_STATE.SEND:
                return <SendController accounts={accounts} onCancel={ ()=>PopupAPI.changeState(APP_STATE.READY) } />;
            case APP_STATE.TRANSACTIONS:
                return <TransactionsController accounts={accounts} onCancel={ ()=>PopupAPI.changeState(APP_STATE.READY) } />;
            default:
                return (
                    <div className='unsupportedState' onClick={ () => PopupAPI.resetState() }>
                        <FormattedMessage id='ERRORS.UNSUPPORTED_STATE' values={{ appState }} />
                    </div>
                );
        }
    }
}

export default connect(state => ({
    appState: state.app.appState,
    accounts: state.accounts
}))(App);

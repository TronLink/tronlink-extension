import React from 'react';

import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';

import { APP_STATE } from '@tronlink/lib/constants';

import RegistrationController from 'controllers/RegistrationController';
import LoginController from 'controllers/LoginController';
import WalletCreationController from 'controllers/WalletCreationController';
import CreateAccountController from 'controllers/CreateAccountController';
import RestoreAccountController from 'controllers/RestoreAccountController';
import PageController from 'controllers/PageController';
import ConfirmationController from 'controllers/ConfirmationController';

import 'react-custom-scroll/dist/customScroll.css';
import 'assets/styles/global.scss';

class App extends React.Component {
    render() {
        const { appState } = this.props;
        console.log(appState);
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
    appState: state.app.appState
}))(App);

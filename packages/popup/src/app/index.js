import React from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
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
import SettingController from '@tronlink/popup/src/controllers/SettingController';
import AddTokenController from '@tronlink/popup/src/controllers/AddTokenController';
import BankController from '@tronlink/popup/src/controllers/TronBankController';
import TestHtmlController from '@tronlink/popup/src/controllers/TestHtmlController';

import 'react-custom-scroll/dist/customScroll.css';
import 'assets/styles/global.scss';
import 'react-toast-mobile/lib/react-toast-mobile.css';
import 'antd-mobile/dist/antd-mobile.css';

import enMessages from '@tronlink/popup/src/translations/en.json';
import zhMessages from '@tronlink/popup/src/translations/zh.json';
import jaMessages from '@tronlink/popup/src/translations/ja.json';
class App extends React.Component {
    messages = {
        en: enMessages,
        zh: zhMessages,
        ja: jaMessages
    };

    render() {
        const { appState, accounts, prices, nodes, language, lock } = this.props;
        let dom = null;
        switch(appState) {
            case APP_STATE.UNINITIALISED:
                dom = <RegistrationController language={language} />
                break;
            case APP_STATE.PASSWORD_SET:
                dom = <LoginController />
                break;
            case APP_STATE.UNLOCKED:
                dom = <WalletCreationController />
                break;
            case APP_STATE.CREATING:
                dom = <CreateAccountController />
                break;
            case APP_STATE.RESTORING:
                dom = <RestoreAccountController />
                break;
            case APP_STATE.READY:
                dom = <PageController />
                break;
            case APP_STATE.REQUESTING_CONFIRMATION:
                dom = <ConfirmationController />
                break;
            case APP_STATE.RECEIVE:
                dom  = <ReceiveController address={accounts.selected.address} onCancel={ () => PopupAPI.changeState(APP_STATE.READY) } />
                break;
            case APP_STATE.SEND:
                dom =  <SendController accounts={accounts} onCancel={ () => PopupAPI.changeState(APP_STATE.READY) } />
                break;
            case APP_STATE.TRANSACTIONS:
                dom = <TransactionsController prices={prices} accounts={accounts} onCancel={ () => PopupAPI.changeState(APP_STATE.READY) } />
                break;
            case APP_STATE.SETTING:
                dom = <SettingController lock={lock} language={language} prices={prices} nodes={nodes} onCancel={ () => PopupAPI.changeState(APP_STATE.READY) } />
                break;
            case APP_STATE.ADD_TRC20_TOKEN:
                dom = <AddTokenController tokens={accounts.selected.tokens} onCancel={ () => PopupAPI.changeState(APP_STATE.READY) } />
                break;
            case APP_STATE.TRONBANK:
                dom = <BankController accounts={accounts}></BankController>
                break;
            case APP_STATE.TESTHMTL:
                dom = <TestHtmlController />;
                break;
            default:
                dom =
                    <div className='unsupportedState' onClick={ () => PopupAPI.resetState() }>
                        <FormattedMessage id='ERRORS.UNSUPPORTED_STATE' values={{ appState }} />
                    </div>;

        }

        return (
            <IntlProvider locale={ language } messages={ this.messages[ language ] }>
                { dom }
            </IntlProvider>
        )
    }
}

export default connect(state => ({
    language: state.app.language,
    appState: state.app.appState,
    accounts: state.accounts,
    nodes: state.app.nodes,
    prices: state.app.prices,
    lock: state.app.setting.lock
}))(App);

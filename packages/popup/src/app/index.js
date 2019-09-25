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
import BankRecordController from '@tronlink/popup/src/controllers/BankRecordController';
import BankDetailController from '@tronlink/popup/src/controllers/BankDetailController';
import BankHelplController from '@tronlink/popup/src/controllers/TronBankHelp';
import IncomeRecordController from '@tronlink/popup/src/controllers/IncomeRecordController';
import ActivityDetailController from '@tronlink/popup/src/controllers/ActivityDetailController';
import DappListController from '@tronlink/popup/src/controllers/DappListController';
import AssetManageController from '@tronlink/popup/src/controllers/AssetManageController';
import TransactionDetailController from '@tronlink/popup/src/controllers/TransactionDetailController';
import DappWhitelistController from '@tronlink/popup/src/controllers/DappWhitelistController';
import LedgerController from '@tronlink/popup/src/controllers/LedgerController';
import LedgerAccountImportController from '@tronlink/popup/src/controllers/LedgerController/LedgerAccountImportController';
import NodeManageController from '@tronlink/popup/src/controllers/NodeManageController';
import TransferController from '@tronlink/popup/src/controllers/TransferController';

import 'antd-mobile/dist/antd-mobile.css';
import 'react-custom-scroll/dist/customScroll.css';
import 'assets/styles/global.scss';
import 'react-toast-mobile/lib/react-toast-mobile.css';

import enMessages from '@tronlink/popup/src/translations/en.json';
import zhMessages from '@tronlink/popup/src/translations/zh.json';
import jaMessages from '@tronlink/popup/src/translations/ja.json';
class App extends React.Component {
    messages = {
        en: enMessages,
        zh: zhMessages,
        ja: jaMessages
    }

    render() {
        const { appState,accounts,prices,nodes,language,lock,version,authorizeDapps,vTokenList,chains } = this.props;
        let dom = null;
        switch(appState) {
            case APP_STATE.UNINITIALISED:
                dom = <RegistrationController language={language} />;
                break;
            case APP_STATE.PASSWORD_SET:
                dom = <LoginController />;
                break;
            case APP_STATE.UNLOCKED:
                dom = <WalletCreationController />;
                break;
            case APP_STATE.CREATING:
                dom = <CreateAccountController />;
                break;
            case APP_STATE.RESTORING:
                dom = <RestoreAccountController />;
                break;
            case APP_STATE.READY:
                dom = <PageController />;
                break;
            case APP_STATE.REQUESTING_CONFIRMATION:
                dom = <ConfirmationController authorizeDapps={authorizeDapps} />;
                break;
            case APP_STATE.RECEIVE:
                dom = <ReceiveController accounts={accounts} address={accounts.selected.address} />;
                break;
            case APP_STATE.SEND:
                dom = <SendController chains={chains} accounts={accounts} />;
                break;
            case APP_STATE.TRANSFER:
                dom = <TransferController accounts={accounts} chains={chains} onCancel={ () => PopupAPI.changeState(APP_STATE.TRANSACTIONS) }  />;
                break;
            case APP_STATE.TRANSACTIONS:
                dom = <TransactionsController chains={chains} prices={prices} accounts={accounts} onCancel={ () => PopupAPI.changeState(APP_STATE.READY) } />;
                break;
            case APP_STATE.SETTING:
                dom = <SettingController lock={lock} version={version} language={language} prices={prices} onCancel={ () => PopupAPI.changeState(APP_STATE.READY) } />
                break;
            case APP_STATE.ADD_TRC20_TOKEN:
                dom = <AddTokenController tokens={accounts.selected.tokens} onCancel={ () => PopupAPI.changeState(APP_STATE.READY) } />;
                break;
            case APP_STATE.TRONBANK:
                dom = <BankController accounts={accounts} language={language} />;
                break;
            case APP_STATE.TRONBANK_RECORD:
                dom = <BankRecordController accounts={accounts} />;
                break;
            case APP_STATE.TRONBANK_DETAIL:
                dom = <BankDetailController accounts={accounts} />;
                break;
            case APP_STATE.TRONBANK_HELP:
                dom = <BankHelplController />;
                break;
            case APP_STATE.USDT_INCOME_RECORD:
                dom = <IncomeRecordController prices={prices} accounts={accounts} onCancel={ () => PopupAPI.changeState(APP_STATE.TRANSACTIONS) } />;
                break;
            case APP_STATE.USDT_ACTIVITY_DETAIL:
                dom = <ActivityDetailController selectedToken={accounts.selectedToken} onCancel={ () => PopupAPI.changeState(APP_STATE.USDT_INCOME_RECORD) } />;
                break;
            case APP_STATE.DAPP_LIST:
                dom = <DappListController onCancel={ () => PopupAPI.changeState(APP_STATE.READY) } />;
                break;
            case APP_STATE.ASSET_MANAGE:
                dom = <AssetManageController chains={chains} prices={prices} vTokenList={vTokenList} selected={accounts.selected} onCancel={ () => PopupAPI.changeState(APP_STATE.READY) } />;
                break;
            case APP_STATE.TRANSACTION_DETAIL:
                dom = <TransactionDetailController selectedToken={accounts.selectedToken} selected={accounts.selected} onCancel={ () => PopupAPI.changeState(APP_STATE.TRANSACTIONS) } />;
                break;
            case APP_STATE.DAPP_WHITELIST:
                dom = <DappWhitelistController authorizeDapps={authorizeDapps} onCancel={ () => PopupAPI.changeState(APP_STATE.SETTING) } />;
                break;
            case APP_STATE.LEDGER:
                dom = <LedgerController language={language} />;
                break;
            case APP_STATE.LEDGER_IMPORT_ACCOUNT:
                dom = <LedgerAccountImportController chains={chains}  />;
                break;
            case APP_STATE.NODE_MANAGE:
                dom = <NodeManageController nodes={nodes} chains={chains}  onCancel={ () => PopupAPI.changeState(APP_STATE.SETTING) } />;
                break;
            default:
                dom =
                    <div className='unsupportedState' onClick={ () => PopupAPI.resetState(APP_STATE.USDT_INCOME_RECORD) }>
                        <FormattedMessage id='ERRORS.UNSUPPORTED_STATE' values={{ appState }} />
                    </div>;
        }

        return (
            <IntlProvider locale={ language } messages={ this.messages[ language ] }>
                { dom }
            </IntlProvider>
        );
    }
}

export default connect(state => ({
    vTokenList: state.app.vTokenList,
    language: state.app.language,
    appState: state.app.appState,
    accounts: state.accounts,
    nodes: state.app.nodes,
    prices: state.app.prices,
    lock: state.app.setting.lock,
    version: state.app.version,
    authorizeDapps: state.app.authorizeDapps,
    chains: state.app.chains
}))(App);

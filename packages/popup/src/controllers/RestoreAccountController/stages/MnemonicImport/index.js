import React from 'react';
import Button from '@tronlink/popup/src/components/Button';
import Utils from '@tronlink/lib/utils';
import Toast, { T } from 'react-toast-mobile';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import NodeService from '@tronlink/backgroundScript/services/NodeService';
import { PopupAPI } from '@tronlink/lib/api';

import './MnemonicImport.scss';
const IMPORT_STAGE = {
    ENTERING_MNEMONIC: 0,
    SELECTING_ACCOUNTS: 1
};

class MnemonicImport extends React.Component {
    state = {
        addresses: [],
        selected: [],
        subStage: IMPORT_STAGE.ENTERING_MNEMONIC,
        mnemonic: '',
        isValid: false,
        isLoading: false,
        error:''
    };

    constructor() {
        super();

        this.onChange = this.onChange.bind(this);
        this.changeStage = this.changeStage.bind(this);
        this.toggleAddress = this.toggleAddress.bind(this);
        this.import = this.import.bind(this);
    }

    onChange({ target: { value } }) {
        const isValid = Utils.validateMnemonic(value);
        const error = !isValid ? 'EXCEPTION.FORMAT_ERROR_MNEMONIC' : '';
        this.setState({
            mnemonic: value,
            isValid,
            error
        });
    }

    async changeStage(newStage) {
        if(newStage === IMPORT_STAGE.SELECTING_ACCOUNTS) {
            const res = await this.generateAccounts();
            if(!res) {
                return false;
            }
        }
        this.setState({
            subStage: newStage
        });
    }

    async generateAccounts() {
        // Move this to Utils (generateXAccounts)

        this.setState({
            isLoading: true
        });
        const { chains } = this.props;
        const { mnemonic } = this.state;
        const { formatMessage } = this.props.intl;
        const addresses = [];
        for(let i = 0; i < 5; i++) {
            let account = Utils.getAccountAtIndex(
                mnemonic,
                i
            );
            if(!(account.address in this.props.accounts)) {
                const accountInfo = await PopupAPI.getAccountInfo(account.address);
                let balance = accountInfo[chains === '_'? 'mainchain':'sidechain'].balance;
                balance = balance ? balance:0;
                account.balance = balance;
                addresses.push(account);
            }

        }
        if(addresses.length === 0) {
            this.setState({
                isLoading: false
            });
            T.notify(formatMessage({id:'CHOOSING_TYPE.MNEMONIC.NO_OPTIONS'}))
            return false;
        } else {
            this.setState({
                addresses,
                isLoading: false
            });
            return true;
        }
    }

    toggleAddress(index) {
        let { selected } = this.state;

        if(selected.includes(index))
            selected = selected.filter(addressIndex => addressIndex !== index);
        else selected.push(index);

        this.setState({
            selected
        });
    }

    async import() {
        let i = 0;
        this.setState({
            isLoading: true
        });

        const {
            addresses,
            selected
        } = this.state;

        const { name } = this.props;
        const isSingle = selected.length === 1;

        for(const internalIndex of selected) {
            i++;
            const { privateKey } = addresses[ internalIndex ];
            const walletName = isSingle ? name : `${ name } #${ i }`;
            await PopupAPI.importAccount(
                privateKey,
                walletName
            );
        }
        PopupAPI.resetState();
    }

    renderAccounts() {
        const {
            addresses,
            selected,
            isLoading
        } = this.state;

        const isValid = !!selected.length;

        return (
            <div className='insetContainer mnemonicImport'>
                <div className='pageHeader'>
                    <div className="back" onClick={ () => this.changeStage(IMPORT_STAGE.ENTERING_MNEMONIC) }></div>
                    <FormattedMessage id="CREATION.RESTORE.MNEMONIC.RELATED_TO.ACCOUNT.TITLE" />
                </div>
                <div className='greyModal'>
                    <div className='modalDesc'>
                        <FormattedMessage id='MNEMONIC_IMPORT.SELECTION' />
                    </div>
                    <div className='addressList'>
                        { addresses.map(({ address,balance }, index) => {
                            const isSelected = selected.includes(index);
                            // const icon = isSelected ? 'dot-circle' : 'circle';
                            const className = `addressOption ${ isSelected ? 'isSelected' : '' } ${ isLoading ? 'isLoading' : '' }`;

                            return (
                                <div
                                    className={ className }
                                    key={ index }
                                    tabIndex={ index + 1 }
                                    onClick={ () => !isLoading && this.toggleAddress(index) }
                                >
                                    <div className={ `checkbox ${ isSelected ? 'isSelected' : '' }` }>&nbsp;</div>
                                    <span className="address">
                                        <span>{ `${address.substr(0,10)}...${address.substr(-10)}` }</span>
                                        <span><FormattedMessage id="COMMON.BALANCE" /> <FormattedMessage id="ACCOUNT.BALANCE" values={{amount:balance/1000000}} /></span>
                                    </span>
                                </div>
                            );
                        }) }
                    </div>
                    <div className='buttonRow'>
                        <Button
                            id='BUTTON.IMPORT'
                            isValid={ isValid }
                            onClick={ () => isValid && this.import() }
                            tabIndex={ addresses.length + 1 }
                            isLoading={ isLoading }
                        />
                    </div>
                </div>
            </div>
        );
    }

    renderInput() {
        const { onCancel } = this.props;
        const { formatMessage } = this.props.intl;
        const {
            mnemonic,
            isValid,
            isLoading,
            // showWarning
            error
        } = this.state;

        return (
            <div className='insetContainer mnemonicImport'>
                <div className='pageHeader'>
                    <div className="back" onClick={ onCancel }></div>
                    <FormattedMessage id="CREATION.RESTORE.MNEMONIC.TITLE" />
                </div>
                <div className={'greyModal'+(!isValid && error?' error':'')}>
                    <Toast />
                    <div className='modalDesc'>
                        <FormattedMessage id='MNEMONIC_IMPORT.DESC' />
                    </div>
                    <div className='inputUnit'>
                        <textarea
                            placeholder={formatMessage({ id: 'CHOOSING_TYPE.MNEMONIC.TITLE' })}
                            className='phraseInput'
                            rows={ 5 }
                            value={ mnemonic }
                            onChange={ this.onChange }
                            tabIndex={ 1 }
                            disabled={ isLoading }
                        />
                        {!isValid ? <div className='tipError'>{error ? <FormattedMessage id={error} /> : null}</div> : null}
                    </div>
                    <div className='buttonRow'>
                        <Button
                            id='BUTTON.CONTINUE'
                            isValid={ isValid }
                            onClick={ () => isValid && this.changeStage(IMPORT_STAGE.SELECTING_ACCOUNTS) }
                            tabIndex={ 2 }
                            isLoading={ isLoading }
                        />
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { subStage } = this.state;

        if(subStage === IMPORT_STAGE.ENTERING_MNEMONIC)
            return this.renderInput();

        return this.renderAccounts();
    }
}

export default injectIntl(
    connect(state => ({
        chains: state.app.chains,
        accounts: state.accounts.accounts
    }))(MnemonicImport)
);

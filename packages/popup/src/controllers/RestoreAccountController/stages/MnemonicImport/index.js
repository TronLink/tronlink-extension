import React from 'react';
import Button from 'components/Button';
import Utils from '@tronlink/lib/utils';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { BUTTON_TYPE } from '@tronlink/lib/constants';
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
        isLoading: false
    };

    constructor() {
        super();

        this.onChange = this.onChange.bind(this);
        this.changeStage = this.changeStage.bind(this);
        this.toggleAddress = this.toggleAddress.bind(this);
        this.import = this.import.bind(this);
    }

    onChange({ target: { value } }) {
        this.setState({
            mnemonic: value,
            isValid: Utils.validateMnemonic(value)
        });
    }

    changeStage(newStage) {
        if(newStage === IMPORT_STAGE.SELECTING_ACCOUNTS)
            this.generateAccounts();

        this.setState({
            subStage: newStage
        });
    }

    generateAccounts() {
        // Move this to Utils (generateXAccounts)

        this.setState({
            isLoading: true
        });

        const { mnemonic } = this.state;
        const addresses = [];

        for(let i = 0; i < 5; i++) {
            const account = Utils.getAccountAtIndex(
                mnemonic,
                i
            );

            if(!(account.address in this.props.accounts))
                addresses.push(account);
        }

        this.setState({
            addresses,
            isLoading: false
        });
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

    import() {
        this.setState({
            isLoading: true
        });

        const {
            addresses,
            selected
        } = this.state;

        const { name } = this.props;
        const isSingle = selected.length === 1;

        selected.forEach((internalIndex, index) => {
            const { privateKey } = addresses[ internalIndex ];
            const walletName = isSingle ? name : `${ name } #${ index + 1 }`;

            return PopupAPI.importAccount(
                privateKey,
                walletName
            );
        });

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
                    TronLink
                </div>
                <div className='greyModal'>
                    <div className='modalDesc hasBottomMargin'>
                        <FormattedMessage id='MNEMONIC_IMPORT.SELECTION' />
                    </div>
                    <div className='addressList'>
                        { addresses.map(({ address }, index) => {
                            const isSelected = selected.includes(index);
                            const icon = isSelected ? 'dot-circle' : 'circle';
                            const className = `addressOption ${ isSelected ? 'isSelected' : '' } ${ isLoading ? 'isLoading' : '' }`;

                            return (
                                <div
                                    className={ className }
                                    key={ index }
                                    tabIndex={ index + 1 }
                                    onClick={ () => !isLoading && this.toggleAddress(index) }
                                >
                                    <FontAwesomeIcon
                                        icon={ icon }
                                        className={ `checkbox ${ isSelected ? 'isSelected' : '' }` }
                                    />
                                    <span className='address mono'>
                                        { address }
                                    </span>
                                </div>
                            );
                        }) }
                    </div>
                    <div className='buttonRow'>
                        <Button
                            id='BUTTON.GO_BACK'
                            type={ BUTTON_TYPE.DANGER }
                            onClick={ () => this.changeStage(IMPORT_STAGE.ENTERING_MNEMONIC) }
                            tabIndex={ addresses.length + 2 }
                            isLoading={ isLoading }
                        />
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

        const {
            mnemonic,
            isValid,
            isLoading
        } = this.state;

        return (
            <div className='insetContainer mnemonicImport'>
                <div className='pageHeader'>
                    TronLink
                </div>
                <div className='greyModal'>
                    <div className='modalDesc hasBottomMargin'>
                        <FormattedMessage id='MNEMONIC_IMPORT.DESC' />
                    </div>
                    <textarea
                        placeholder='Mnemonic Import'
                        className='phraseInput mono'
                        rows={ 5 }
                        value={ mnemonic }
                        onChange={ this.onChange }
                        tabIndex={ 1 }
                        disabled={ isLoading }
                    />
                    <div className='buttonRow'>
                        <Button
                            id='BUTTON.GO_BACK'
                            type={ BUTTON_TYPE.DANGER }
                            onClick={ onCancel }
                            tabIndex={ 3 }
                            isLoading={ isLoading }
                        />
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

export default connect(state => ({
    accounts: state.accounts.accounts
}))(MnemonicImport);
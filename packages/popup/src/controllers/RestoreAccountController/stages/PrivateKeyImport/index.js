import React from 'react';
import Button from 'components/Button';
import TronWeb from 'tronweb';

import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { BUTTON_TYPE } from '@tronlink/lib/constants';
import { PopupAPI } from '@tronlink/lib/api';

import './PrivateKeyImport.scss';

class PrivateKeyImport extends React.Component {
    state = {
        privateKey: '',
        isValid: false
    };

    constructor() {
        super();

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onChange({ target: { value } }) {
        const { accounts } = this.props;
        const address = TronWeb.address.fromPrivateKey(value);

        let isValid = false;

        if(address)
            isValid = true;

        if(address in accounts)
            isValid = false;

        this.setState({
            privateKey: value.trim(),
            isValid
        });
    }

    onSubmit() {
        const { privateKey } = this.state;
        const { name } = this.props;

        PopupAPI.importAccount(
            privateKey,
            name
        );

        PopupAPI.resetState();
    }

    render() {
        const { onCancel } = this.props;

        const {
            privateKey,
            isValid
        } = this.state;

        return (
            <div className='insetContainer privateKeyImport'>
                <div className='pageHeader'>
                    TronLink
                </div>
                <div className='greyModal'>
                    <div className='modalDesc hasBottomMargin'>
                        <FormattedMessage id='PRIVATE_KEY_IMPORT.DESC' />
                    </div>
                    <textarea
                        placeholder='Private Key Import'
                        className='privateKeyInput mono'
                        rows={ 5 }
                        value={ privateKey }
                        onChange={ this.onChange }
                        tabIndex={ 1 }
                    />
                    <div className='buttonRow'>
                        <Button
                            id='BUTTON.GO_BACK'
                            type={ BUTTON_TYPE.DANGER }
                            onClick={ onCancel }
                            tabIndex={ 3 }
                        />
                        <Button
                            id='BUTTON.CONTINUE'
                            isValid={ isValid }
                            onClick={ () => isValid && this.onSubmit() }
                            tabIndex={ 2 }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    accounts: state.accounts.accounts
}))(PrivateKeyImport);
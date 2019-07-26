import React from 'react';
import Button from '@tronlink/popup/src/components/Button';
import TronWeb from 'tronweb';

import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';

import './PrivateKeyImport.scss';

class PrivateKeyImport extends React.Component {
    state = {
        privateKey: '',
        isValid: false,
        error: '',
        loading: false
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
        let error = '';
        if(address && TronWeb.isAddress(address)) {
            isValid = true;
            error = '';
        }else{
            isValid = false;
            error = 'EXCEPTION.FORMAT_ERROR';
        }
        if(address in accounts) {
            isValid = false;
            error = 'EXCEPTION.ACCOUNT_EXIST';
        }
        if(value === '')error = '';
        this.setState({
            privateKey: value.trim(),
            isValid,
            error
        });
    }

    async onSubmit() {
        const { privateKey } = this.state;
        const { name } = this.props;
        this.setState({ loading: true });
        const res = await PopupAPI.importAccount(
            privateKey,
            name
        );

        if(res) {
            this.setState({ loading: false });
            PopupAPI.resetState();
        }
    }

    render() {
        const { onCancel } = this.props;
        const { formatMessage } = this.props.intl;
        const {
            privateKey,
            isValid,
            error,
            loading
        } = this.state;

        return (
            <div className='insetContainer privateKeyImport'>
                <div className='pageHeader'>
                    <div className="back" onClick={ onCancel }></div>
                    <FormattedMessage id="CREATION.RESTORE.PRIVATE_KEY.TITLE" />
                </div>
                <div className={'greyModal'+(!isValid && error?' error':'')}>
                    <div className='modalDesc hasBottomMargin'>
                        <FormattedMessage id='PRIVATE_KEY_IMPORT.DESC' />
                    </div>
                    <div className="inputUnit">
                        <textarea
                            placeholder={formatMessage({id:'CHOOSING_TYPE.PRIVATE_KEY.TITLE'})}
                            className='privateKeyInput'
                            rows={ 5 }
                            value={ privateKey }
                            onChange={ this.onChange }
                            tabIndex={ 1 }
                        />
                        {!isValid ? <div className="tipError">{error?<FormattedMessage id={error} />:null}</div>:null}
                    </div>

                    <div className='buttonRow'>
                        <Button
                            id='BUTTON.CONTINUE'
                            isValid={ isValid }
                            isLoading={ loading }
                            onClick={ () => isValid && this.onSubmit() }
                            tabIndex={ 2 }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(connect(state => ({
    accounts: state.accounts.accounts
}))(PrivateKeyImport));

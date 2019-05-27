import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import Toast, { T } from 'react-toast-mobile';
import TronWeb from 'tronweb';
class AddTokenController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: {
                value: '',
                valid: false
            }
        };
    }

    async addToken(address) {
        if(!this.state.address.valid)
            return;

        const { smart } = this.props.tokens;
        const { formatMessage } = this.props.intl;
        const token = await PopupAPI.getSmartToken(address);
        if(!token) {
            T.notify(formatMessage({ id: 'ERRORS.INVALID_TOKEN' }));
            return;
        }

        if(Object.keys(smart).some((key) => key === address)) {
            T.notify(formatMessage({ id: 'ERRORS.TOKEN_ADDED' }));
            return;
        }

        await PopupAPI.addSmartToken(address, token.name, token.symbol, token.decimals);
        T.notify(formatMessage({ id: 'TOAST.ADDED' }));
    }

    render() {
        const { formatMessage } = this.props.intl;
        const { onCancel } = this.props;
        return (
            <div className='insetContainer send' onClick={ () => { this.setState({ isOpen: {account: false, token: false } }); } }>
                <div className='pageHeader'>
                    <div className='back' onClick={onCancel}> </div>
                    <FormattedMessage id='MENU.ADD_TRC20_TOKEN'/>
                </div>
                <div className='greyModal'>
                    <Toast />
                    <div className='input-group'>
                        <div className='input'>
                            <input type='text' onChange={ (e) => {
                                const value = e.target.value;
                                this.state.address.value = value;
                                this.state.address.valid = TronWeb.isAddress(value);
                                this.setState({ address: this.state.address });
                            }} placeholder={formatMessage({ id: 'MENU.ADD_TRC20_TOKEN.INPUT_PLACE_HOLDER' })} />
                        </div>
                    </div>
                    <button onClick={ () => this.addToken(this.state.address.value) } className={('customButton primary addToken') + ( this.state.address.valid ? ' is-valid' : ' is-invalid') }>
                        <FormattedMessage id='BUTTON.ADD_TOKEN' />
                    </button>
                </div>
            </div>
        );
    }
}

export default injectIntl(AddTokenController);

import React from 'react';
import Button from 'components/Button';
import CustomScroll from 'react-custom-scroll';

import { PopupAPI } from '@tronlink/lib/api';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import {
    APP_STATE,
    BUTTON_TYPE
} from '@tronlink/lib/constants';

import './AccountsPage.scss';

class AccountsPage extends React.Component {
    componentDidUpdate(prevProps) {
        const { selected: previous } = prevProps.accounts;
        const { selected } = this.props.accounts;

        if(selected.name !== previous.name)
            this.props.setSubTitle(selected.name);
    }

    onClick(address) {
        const { selected } = this.props.accounts;

        if(selected.address === address)
            return;

        PopupAPI.selectAccount(address);
    }

    renderOptions() {
        return (
            <div className='accountOptions'>
                <Button
                    type={ BUTTON_TYPE.WHITE }
                    onClick={ () => PopupAPI.changeState(APP_STATE.CREATING) }
                    id='BUTTON.CREATE'
                />
                <Button
                    type={ BUTTON_TYPE.WHITE }
                    onClick={ () => PopupAPI.changeState(APP_STATE.RESTORING) }
                    id='BUTTON.IMPORT'
                />
                <Button
                    type={ BUTTON_TYPE.WHITE }
                    id='BUTTON.EXPORT'
                    isValid={ false }
                />
                <Button
                    type={ BUTTON_TYPE.WHITE }
                    id='BUTTON.DELETE'
                    isValid={ false }
                />
            </div>
        );
    }

    renderAccounts() {
        const {
            accounts,
            selected
        } = this.props.accounts;

        return Object.entries(accounts).map(([ address, account ]) => (
            <div
                className={ `account ${ selected.address === address ? 'active' : '' }` }
                onClick={ () => this.onClick(address) }
                key={ address }
            >
                <span className='accountName'>
                    { account.name }
                </span>
                <span className='accountAddress'>
                    { address }
                </span>
                <div className='accountDetails'>
                    <span className='accountBalance'>
                        { account.balance ?
                            <FormattedMessage id='ACCOUNT.BALANCE' values={{ amount: account.balance / 1000000 }} /> :
                            <FormattedMessage id='ACCOUNT.NO_BALANCE' />
                        }
                    </span>
                    <span className='accountTokens'>
                        { account.tokenCount ?
                            <FormattedMessage id='ACCOUNT.TOKENS' values={{ amount: account.tokenCount }} /> :
                            <FormattedMessage id='ACCOUNT.NO_TOKENS' />
                        }
                    </span>
                </div>
                <div className='accountDetails'>
                    <span className='accountBalance'>
                        { account.bandwidth ?
                            <FormattedMessage id='ACCOUNT.BANDWIDTH' values={{ amount: account.bandwidth }} /> :
                            <FormattedMessage id='ACCOUNT.NO_BANDWIDTH' />
                        }
                    </span>
                    <span className='accountTokens'>
                        { account.energy ?
                            <FormattedMessage id='ACCOUNT.ENERGY' values={{ amount: account.energy }} /> :
                            <FormattedMessage id='ACCOUNT.NO_ENERGY' />
                        }
                    </span>
                </div>
            </div>
        ));
    }

    render() {
        return (
            <div className='accountsPage'>
                { this.renderOptions() }
                <div className='accountsList'>
                    <CustomScroll heightRelativeToParent='100%'>
                        { this.renderAccounts() }
                    </CustomScroll>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    accounts: state.accounts
}))(AccountsPage);
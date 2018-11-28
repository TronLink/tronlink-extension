import React from 'react';
import Button from 'components/Button';
import CustomScroll from 'react-custom-scroll';
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { PopupAPI } from '@tronlink/lib/api';
import { connect } from 'react-redux';

import {
    FormattedMessage,
    injectIntl
} from 'react-intl';

import {
    APP_STATE,
    BUTTON_TYPE
} from '@tronlink/lib/constants';

import './AccountsPage.scss';

const ReactSwal = withReactContent(swal);

class AccountsPage extends React.Component {
    constructor() {
        super();

        this.onClick = this.onClick.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onExport = this.onExport.bind(this);
    }

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

    async onDelete() {
        const { formatMessage } = this.props.intl;

        const { value } = await swal({
            title: formatMessage({ id: 'ACCOUNTS.CONFIRM_DELETE' }),
            text: formatMessage({ id: 'ACCOUNTS.CONFIRM_DELETE.BODY' }),
            confirmButtonText: formatMessage({ id: 'BUTTON.CONFIRM' }),
            cancelButtonText: formatMessage({ id: 'BUTTON.CANCEL' }),
            showCancelButton: true
        });

        if(!value)
            return;

        PopupAPI.deleteAccount();
    }

    async onExport() {
        const { formatMessage } = this.props.intl;

        const {
            mnemonic,
            privateKey
        } = await PopupAPI.exportAccount();

        const swalContent = [];

        if(mnemonic) {
            swalContent.push(
                <div className='export'>
                    <span className='header'>
                        { formatMessage({ id: 'ACCOUNTS.EXPORT.MNEMONIC' }) }
                    </span>
                    <span className='content'>
                        { mnemonic }
                    </span>
                </div>
            );
        }

        swalContent.push(
            <div className='export'>
                <span className='header'>
                    { formatMessage({ id: 'ACCOUNTS.EXPORT.PRIVATE_KEY' }) }
                </span>
                <span className='content'>
                    { privateKey }
                </span>
            </div>
        );

        ReactSwal.fire({
            title: formatMessage({ id: 'ACCOUNTS.EXPORT' }),
            cancelButtonText: formatMessage({ id: 'BUTTON.CLOSE' }),
            showCancelButton: true,
            showConfirmButton: false,
            html: (
                <div className='exportDetails'>
                    { swalContent }
                </div>
            )
        });
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
                    onClick={ this.onExport }
                />
                <Button
                    type={ BUTTON_TYPE.WHITE }
                    id='BUTTON.DELETE'
                    onClick={ this.onDelete }
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

export default injectIntl(
    connect(state => ({
        accounts: state.accounts
    }))(AccountsPage)
);
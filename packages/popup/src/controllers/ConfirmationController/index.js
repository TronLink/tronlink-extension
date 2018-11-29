import React from 'react';
import Button from 'components/Button';
import TronWeb from 'tronweb';
import Dropdown from 'react-dropdown';

import { app } from 'index';
import { PopupAPI } from '@tronlink/lib/api';
import { connect } from 'react-redux';

import {
    FormattedMessage,
    FormattedHTMLMessage,
    injectIntl
} from 'react-intl';

import {
    CONFIRMATION_TYPE,
    BUTTON_TYPE
} from '@tronlink/lib/constants';

import 'react-dropdown/style.css';
import './ConfirmationController.scss';

class ConfirmationController extends React.Component {
    constructor({ intl }) {
        super();

        this.loadWhitelistOptions(intl);

        this.onReject = this.onReject.bind(this);
        this.onAccept = this.onAccept.bind(this);
        this.onWhitelist = this.onWhitelist.bind(this);
    }

    loadWhitelistOptions({ formatMessage }) {
        const options = [{
            value: false,
            label: formatMessage({ id: 'CONFIRMATIONS.OPTIONS.NO' })
        }, {
            value: 15 * 60 * 1000,
            label: formatMessage({ id: 'CONFIRMATIONS.OPTIONS.FIFTEEN_MINUTES' })
        }, {
            value: 30 * 60 * 1000,
            label: formatMessage({ id: 'CONFIRMATIONS.OPTIONS.THIRTY_MINUTES' })
        }, {
            value: 60 * 60 * 1000,
            label: formatMessage({ id: 'CONFIRMATIONS.OPTIONS.ONE_HOUR' })
        }, {
            value: 24 * 60 * 60 * 1000,
            label: formatMessage({ id: 'CONFIRMATIONS.OPTIONS.ONE_DAY' })
        }, {
            value: -1,
            label: formatMessage({ id: 'CONFIRMATIONS.OPTIONS.NEXT_LOGIN' })
        }];

        // eslint-disable-next-line
        this.state = {
            whitelisting: {
                selected: options[ 0 ],
                options
            }
        };
    }

    onReject() {
        PopupAPI.rejectConfirmation();
    }

    onAccept() {
        const {
            selected
        } = this.state.whitelisting;

        const {
            hostname,
            contractType,
            input
        } = this.props.confirmation;

        if(contractType === 'TriggerSmartContract') {
            const value = input.call_value || 0;

            app.analytics.event({
                category: 'Smart Contract',
                action: 'Used Smart Contract',
                label: `${ hostname } - ${ input.contract_address }`,
                value
            });
        }

        PopupAPI.acceptConfirmation(selected.value);
    }

    onWhitelist(selected) {
        this.setState({
            whitelisting: {
                ...this.state.whitelisting,
                selected
            }
        });
    }

    renderMessage() {
        return null;
    }

    renderTransaction() {
        const {
            options,
            selected
        } = this.state.whitelisting;

        const {
            formatMessage,
            formatNumber
        } = this.props.intl;

        const {
            hostname,
            contractType,
            input
        } = this.props.confirmation;

        const meta = [];
        const showWhitelist = contractType === 'TriggerSmartContract';

        let showParameters = false;

        if(input.call_value)
            meta.push({ key: 'CONFIRMATIONS.COST', value: formatNumber(input.call_value / 1000000) });

        if(input.amount)
            meta.push({ key: 'CONFIRMATIONS.COST', value: formatNumber(input.amount / 1000000) });

        if(input.frozen_balance)
            meta.push({ key: 'CONFIRMATIONS.COST', value: formatNumber(input.frozen_balance / 1000000) });

        if(input.asset_name)
            meta.push({ key: 'CONFIRMATIONS.TOKEN', value: TronWeb.toUtf8(input.asset_name) });

        if(input.token_id)
            meta.push({ key: 'CONFIRMATIONS.TOKEN', value: TronWeb.toUtf8(input.token_id) });

        if(input.to_address) {
            const address = TronWeb.address.fromHex(input.to_address);
            const trimmed = [
                address.substr(0, 16),
                address.substr(28)
            ].join('...');

            meta.push({ key: 'CONFIRMATIONS.RECIPIENT', value: trimmed });
        }

        if(input.resource)
            meta.push({ key: 'CONFIRMATIONS.RESOURCE', value: formatMessage({ id: `CONFIRMATIONS.RESOURCE.${ input.resource }` }) });

        if(input.function_selector)
            meta.push({ key: 'CONFIRMATIONS.FUNCTION', value: input.function_selector });

        if(input.trx_num)
            meta.push({ key: 'CONFIRMATIONS.TRX_RATIO', value: formatNumber(input.trx_num) });

        if(input.num)
            meta.push({ key: 'CONFIRMATIONS.TOKEN_RATIO', value: formatNumber(input.num) });

        if(input.account_name)
            meta.push({ key: 'CONFIRMATIONS.ACCOUNT_NAME', value: input.account_name });

        if(input.proposal_id)
            meta.push({ key: 'CONFIRMATIONS.PROPOSAL_ID', value: input.proposal_id });

        if(input.quant)
            meta.push({ key: 'CONFIRMATIONS.QUANTITY', value: formatNumber(input.quant) });

        // This should be translated
        if('is_add_approval' in input)
            meta.push({ key: 'CONFIRMATIONS.APPROVE', value: input.is_add_approval });

        switch(contractType) {
            case 'ProposalCreateContract':
            case 'ExchangeCreateContract':
            case 'ExchangeInjectContract':
            case 'ExchangeWithdrawContract':
            case 'CreateSmartContract':
                showParameters = true;
                break;
            default:
                showParameters = false;
        }

        return (
            <React.Fragment>
                <div className='modalDesc hasBottomMargin'>
                    <FormattedHTMLMessage
                        id='CONFIRMATIONS.BODY'
                        values={{
                            hostname: encodeURIComponent(hostname),
                            action: formatMessage({ id: `CONTRACTS.${ contractType }` })
                        }}
                    />
                </div>
                { meta.length ? (
                    <div className='meta'>
                        { meta.map(({ key, value }) => (
                            <div className='metaLine' key={ key }>
                                <FormattedMessage id={ key } />
                                <span className='value'>
                                    { value }
                                </span>
                            </div>
                        )) }
                    </div>
                ) : '' }
                { showParameters ? (
                    <div className='parameters mono'>
                        { JSON.stringify(input, null, 2 ) }
                    </div>
                ) : '' }
                { showWhitelist ? (
                    <div className='whitelist'>
                        <FormattedMessage
                            id='CONFIRMATIONS.WHITELIST.TITLE'
                            children={ text => (
                                <div className='whitelistTitle'>
                                    { text }
                                </div>
                            ) }
                        />
                        <FormattedMessage
                            id='CONFIRMATIONS.WHITELIST.BODY'
                            children={ text => (
                                <div className='whitelistBody'>
                                    { text }
                                </div>
                            ) }
                        />
                        <Dropdown
                            className='dropdown'
                            options={ options }
                            value={ selected }
                            onChange={ this.onWhitelist }
                        />
                    </div>
                ) : '' }
            </React.Fragment>
        );
    }

    render() {
        const {
            type
        } = this.props.confirmation;

        return (
            <div className='insetContainer confirmationController'>
                <FormattedMessage id='CONFIRMATIONS.HEADER' children={ text => (
                    <div className='pageHeader'>
                        { text }
                    </div>
                ) }
                />
                <div className='greyModal'>
                    { type === CONFIRMATION_TYPE.STRING ?
                        this.renderMessage() :
                        this.renderTransaction()
                    }
                    <div className='buttonRow'>
                        <Button
                            id='BUTTON.REJECT'
                            type={ BUTTON_TYPE.DANGER }
                            onClick={ this.onReject }
                            tabIndex={ 3 }
                        />
                        <Button
                            id='BUTTON.ACCEPT'
                            onClick={ this.onAccept }
                            tabIndex={ 2 }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(
    connect(state => ({
        confirmation: state.confirmations[ 0 ]
    }))(ConfirmationController)
);
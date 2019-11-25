import React from 'react';
import Button from '@tronlink/popup/src/components/Button';
import Alert from '@tronlink/popup/src/components/Alert';
import TronWeb from 'tronweb';
import Dropdown from 'react-dropdown';
import Utils from '@tronlink/lib/utils';
import { PopupAPI } from '@tronlink/lib/api';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import {
    FormattedMessage,
    FormattedHTMLMessage,
    injectIntl
} from 'react-intl';

import {
    CONFIRMATION_TYPE,
    BUTTON_TYPE,
    ACCOUNT_TYPE
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
        this.tokensMap = JSON.parse(localStorage.getItem('tokensMap'));
    }

    async componentDidMount() {
        const {
            contractType,
            input: { parameter, contract_address, function_selector }
        } = this.props.confirmation;
        if (contractType === 'TriggerSmartContract') {
            const abi = await PopupAPI.getAbiCode(contract_address);
            const args = Utils.decodeParams(parameter, abi, function_selector);
            this.setState({ args });
        }
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
            args: [],
            showArgs: false,
            whitelisting: {
                selected: options[0],
                options,
                isAutoAuthorize: false
            }
        };
    }

    async addUsedDapp() {
        const { hostname } = this.props.confirmation;
        const dappList = await PopupAPI.getDappList(true);
        const { used } = dappList;
        const tronDapps = await PopupAPI.getAllDapps();
        const regExp = new RegExp(hostname);
        if (used.length && used.some(({ href }) => href.match(regExp))) {
            const index = used.findIndex(({ href }) => href.match(regExp));
            const item = used.find(({ href }) => href.match(regExp));
            used.splice(index, 1);
            used.unshift(item);
        } else {
            const dapp = tronDapps.filter(({ href }) => href.match(regExp));
            if (dapp.length) used.unshift(dapp[0]);
        }
        dappList.used = used;
        PopupAPI.setDappList(dappList);
    }

    onReject() {
        PopupAPI.rejectConfirmation();
    }

    async onAccept() {
        const {
            selected,
            isAutoAuthorize
        } = this.state.whitelisting;
        const { confirmation, authorizeDapps } = this.props;
        if (confirmation.contractType === 'TriggerSmartContract') {
            await this.addUsedDapp();
            const contractAddress = TronWeb.address.fromHex(confirmation.input.contract_address);
            if (isAutoAuthorize && !authorizeDapps.hasOwnProperty(contractAddress)) {
                const o = {};
                o.url = confirmation.hostname;
                o.contract = contractAddress;
                o.addTime = new Date().getTime();
                authorizeDapps[contractAddress] = o;
                PopupAPI.setAuthorizeDapps(authorizeDapps);
            }
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
        const {
            formatMessage
        } = this.props.intl;

        const {
            hostname,
            input
        } = this.props.confirmation;

        const {
            options,
            selected,
            isAutoAuthorize
        } = this.state.whitelisting;

        return (
            <React.Fragment>
                <div className='modalDesc hasBottomMargin'>
                    <FormattedHTMLMessage
                        id='CONFIRMATIONS.BODY'
                        values={{
                            hostname: encodeURIComponent(hostname),
                            action: formatMessage({ id: 'CONTRACTS.SignMessage' })
                        }}
                    />
                </div>
                <div className='parameters mono'>
                    {input}
                </div>
                <div className='whitelist hasBottomMargin'>
                    <FormattedMessage
                        id='CONFIRMATIONS.WHITELIST.TITLE'
                        children={text => (
                            <div className='whitelistTitle'>
                                {text}
                            </div>
                        )}
                    />
                    <FormattedMessage
                        id='CONFIRMATIONS.WHITELIST.BODY'
                        children={text => (
                            <div className='whitelistBody'>
                                {text}
                            </div>
                        )}
                    />
                    <Dropdown
                        disabled={isAutoAuthorize}
                        className='dropdown'
                        options={options}
                        value={selected}
                        onChange={this.onWhitelist}
                    />
                </div>
            </React.Fragment>
        );
    }

    renderTransaction() {
        const { args, showArgs } = this.state;
        const {
            options,
            selected,
            isAutoAuthorize
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
        //const showWhitelist = true;
        const showAuthorizeAudio = contractType === 'TriggerSmartContract';

        let showParameters = false;

        if (input.call_value) {
            meta.push({ key: 'CONFIRMATIONS.COST', value: formatNumber(input.call_value / 1000000) });
        }

        if (input.amount && contractType === 'TransferContract') {
            meta.push({ key: 'CONFIRMATIONS.COST', value: formatNumber(input.amount / 1000000) });
        } else if (input.amount) {
            meta.push({ key: 'CONFIRMATIONS.COST', value: formatNumber(input.amount) });
        }

        if (input.frozen_balance) {
            meta.push({ key: 'CONFIRMATIONS.COST', value: formatNumber(input.frozen_balance / 1000000) });
        }

        if (input.asset_name) {
            meta.push({
                key: 'CONFIRMATIONS.TOKEN',
                value: this.tokensMap[TronWeb.toUtf8(input.asset_name)].split('_')[0] + ' (' + TronWeb.toUtf8(input.asset_name) + ')'
            });
        }

        if (input.token_id) {
            meta.push({ key: 'CONFIRMATIONS.TOKEN', value: input.token_id });
        }

        if (input.to_address) {
            const address = TronWeb.address.fromHex(input.to_address);
            const trimmed = [
                address.substr(0, 16),
                address.substr(28)
            ].join('...');

            meta.push({ key: 'CONFIRMATIONS.RECIPIENT', value: trimmed });
        }

        if (input.resource) {
            meta.push({
                key: 'CONFIRMATIONS.RESOURCE',
                value: formatMessage({ id: `CONFIRMATIONS.RESOURCE.${ input.resource }` })
            });
        }

        if (input.function_selector) {
            meta.push({ key: 'CONFIRMATIONS.FUNCTION', value: input.function_selector });
            //args.length && args.map(({name,type,value})=>({key:name,value})).forEach(v=>meta.push(v))
        }

        if (input.trx_num) {
            meta.push({ key: 'CONFIRMATIONS.TRX_RATIO', value: formatNumber(input.trx_num) });
        }

        if (input.num) {
            meta.push({ key: 'CONFIRMATIONS.TOKEN_RATIO', value: formatNumber(input.num) });
        }

        if (input.account_name) {
            meta.push({ key: 'CONFIRMATIONS.ACCOUNT_NAME', value: input.account_name });
        }

        if (input.proposal_id) {
            meta.push({ key: 'CONFIRMATIONS.PROPOSAL_ID', value: input.proposal_id });
        }

        if (input.quant) {
            meta.push({ key: 'CONFIRMATIONS.QUANTITY', value: formatNumber(input.quant) });
        }

        // This should be translated
        if ('is_add_approval' in input) {
            meta.push({ key: 'CONFIRMATIONS.APPROVE', value: input.is_add_approval });
        }

        switch (contractType) {
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
                <div className='modalDesc'>
                    <FormattedHTMLMessage
                        id='CONFIRMATIONS.BODY'
                        values={{
                            hostname: encodeURIComponent(hostname),
                            action: formatMessage({ id: `CONTRACTS.${ contractType }` })
                        }}
                    />
                </div>
                {meta.length ? (
                    <div className='meta'>
                        {meta.map(({ key, value }) => (
                            key === 'CONFIRMATIONS.FUNCTION' ?
                                <div className={'function' + (showArgs ? ' show' : '')}>
                                    <div data-tip={formatMessage({ id: 'CONFIRMATIONS.CLICK_SHOW_PARAMS' })}
                                         data-for='showArgs' className='metaLine'
                                         onClick={() => args.length && this.setState({ showArgs: !showArgs })}
                                         key={key}>
                                        <FormattedMessage id={key}/>
                                        <span className='value'>
                                        {value}
                                        </span>
                                        {args.length ? <ReactTooltip id='showArgs' effect='solid'/> : null}
                                    </div>
                                    <div className="show_arg" onClick={e => e.stopPropagation()}>
                                        {
                                            JSON.stringify(args.map(({ name, value }) => {
                                                const v = {};
                                                v[name] = value;
                                                return v;
                                            }))
                                        }
                                    </div>
                                </div>
                                :
                                <div className='metaLine' key={key}>
                                    <FormattedMessage id={key}/>
                                    <span className='value'>
                                        {value}
                                    </span>
                                </div>
                        ))}
                    </div>
                ) : null}
                {showParameters ? (
                    <div className='parameters mono'>
                        {JSON.stringify(input, null, 2)}
                    </div>
                ) : null}
                {showWhitelist ? (
                    <div className='whitelist'>
                        <FormattedMessage
                            id='CONFIRMATIONS.WHITELIST.TITLE'
                            children={text => (
                                <div className='whitelistTitle'>
                                    {text}
                                </div>
                            )}
                        />
                        <FormattedMessage
                            id='CONFIRMATIONS.WHITELIST.BODY'
                            children={text => (
                                <div className='whitelistBody'>
                                    {text}
                                </div>
                            )}
                        />
                        <Dropdown
                            disabled={isAutoAuthorize}
                            className='dropdown'
                            options={options}
                            value={selected}
                            onChange={this.onWhitelist}
                        />
                    </div>
                ) : null}
                {
                    showAuthorizeAudio ?
                        <div className='authorize' onClick={() => {
                            const { whitelisting } = this.state;
                            whitelisting.isAutoAuthorize = !whitelisting.isAutoAuthorize;
                            this.setState({ whitelisting });
                        }}>
                            <div className={'radio' + (isAutoAuthorize ? ' checked' : '')}>&nbsp;</div>
                            <div className='txt'>
                                <FormattedMessage id='CONFIRMATIONS.AUTO_AUTHORIZE.DESC'/>
                            </div>
                        </div>
                        :
                        null
                }
            </React.Fragment>
        );
    }

    render() {
        const {
            type,
            input: { parameter, contract_address }
        } = this.props.confirmation;
        return (
            <div className='insetContainer confirmationController'>
                {
                    this.props.type !== ACCOUNT_TYPE.LEDGER
                        ?
                        <div className='greyModal confirmModal'>
                            <FormattedMessage id='CONFIRMATIONS.HEADER' children={text => (
                                <div className='pageHeader hasBottomMargin'>
                                    {text}
                                </div>
                            )}
                            />
                            {type === CONFIRMATION_TYPE.STRING ?
                                this.renderMessage() :
                                (type === CONFIRMATION_TYPE.TRANSACTION ?
                                        this.renderTransaction() : null
                                )
                            }
                            <div className='buttonRow'>
                                <Button
                                    id='BUTTON.REJECT'
                                    type={BUTTON_TYPE.DANGER}
                                    onClick={this.onReject}
                                    tabIndex={3}
                                />
                                <Button
                                    id='BUTTON.ACCEPT'
                                    onClick={this.onAccept}
                                    tabIndex={2}
                                />
                            </div>
                        </div>
                        :
                        <Alert onClose={() => PopupAPI.rejectConfirmation()}/>
                }
            </div>
        );
    }
}

export default injectIntl(
    connect(state => ({
        type: state.accounts.selected.type,
        confirmation: state.confirmations[0]
    }))(ConfirmationController)
);

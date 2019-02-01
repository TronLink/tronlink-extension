import React from 'react';

import Button from '@tronlink/popup/src/components/Button';
import CustomScroll from 'react-custom-scroll';
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { BigNumber } from 'bignumber.js';
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

const trxImg = require('@tronlink/popup/src/assets/images/new/trx.png');
const token10DefaultImg = require('@tronlink/popup/src/assets/images/new/token_10_default.png');


const ReactSwal = withReactContent(swal);

class AccountsPage extends React.Component {
    constructor() {
        super();

        this.onClick = this.onClick.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onExport = this.onExport.bind(this);
        this.state = {
            showAccountList:false,
            showMenuList:false
        }
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
    renderAccountInfo(accounts,prices){
        const {showAccountList,showMenuList} = this.state;
        const addresses = Object.entries(accounts.accounts).map(([address,item]) => ({address,name:item.name}));
        const p = (prices.priceList[prices.selected] * accounts.selected.balance / Math.pow(10,6)).toFixed(2);
        return (
            <div className="accountInfo">
                <div className="row1">
                    <div className="menu" onClick={()=>{this.setState({showMenuList:!showMenuList,showAccountList:false})}}>
                        <div className="dropList menuList" style={showMenuList?{width:'160px',height:30*4,opacity:1}:{}}>
                            <div onClick={ this.onExport } className="item">
                                <span className="icon backup"></span>
                                <FormattedMessage id="MENU.BACKUP" />
                            </div>
                            <div onClick={()=>{ }} className="item">
                                <span className="icon accountInfo"></span>
                                <FormattedMessage id="MENU.ACCOUNT_DETAIL" />
                            </div>
                            <div className="item" onClick={ () => {} }>
                                <span className="icon whitelist"></span>
                                <FormattedMessage id="MENU.WHITE_LIST" />
                            </div>
                            <div className="item" onClick={ () => {} }>
                                <span className="icon delete"></span>
                                <FormattedMessage id="MENU.DELETE_WALLET" />
                            </div>
                        </div>
                    </div>
                    <div className="accountWrap" onClick={()=>{this.setState({showAccountList:!showAccountList,showMenuList:false})}}>
                        <span>{accounts.selected.name}</span>
                        <div className="dropList accountList" style={showAccountList?{width:'100%',height:30*(addresses.length+2),opacity:1}:{}}>
                            {
                                addresses.map(
                                    v => (
                                        <div onClick={()=>{ this.onClick(v.address) }} className="item" key={v.address}>
                                            <span className="icon account"></span>
                                            <span>{v.name}</span>
                                            {
                                                v.address === accounts.selected.address
                                                    ?
                                                    <span className="selected"></span>
                                                    :
                                                    null
                                            }
                                        </div>
                                    )
                                )
                            }
                            <div className="item" onClick={ () => PopupAPI.changeState(APP_STATE.CREATING) }>
                                <span className="icon create"></span>
                                <FormattedMessage id="CREATION.CREATE.TITLE" />
                            </div>
                            <div className="item" onClick={ () => PopupAPI.changeState(APP_STATE.RESTORING) }>
                                <span className="icon import"></span>
                                <FormattedMessage id="CREATION.RESTORE.TITLE" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row2">
                    <span>{accounts.selected.address.substr(0,10)+'...'+accounts.selected.address.substr(-10)}</span>
                    <span className="copy"></span>
                </div>
                <div className="row3">
                    ≈ {p} {prices.selected}
                </div>
                <div className="row4">
                    <div onClick={ () => PopupAPI.changeState(APP_STATE.RECEIVE) }>
                        <span></span>
                        <FormattedMessage id="ACCOUNT.RECEIVE" />
                    </div>
                    <div onClick={ () => PopupAPI.changeState(APP_STATE.SEND) }>
                        <span></span>
                        <FormattedMessage id="ACCOUNT.SEND" />
                    </div>
                </div>
            </div>
        )
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
    renderResource(account){
        return (
            account?
            <div className="resource">
                <div className="cell">
                    <div className="icon icon-bandwidth"></div>
                    <div className="info">
                        <FormattedMessage id='CONFIRMATIONS.RESOURCE.BANDWIDTH' />
                        <span>{account.netUsed}/{account.netLimit}</span>
                    </div>
                </div>
                <div className="cell">
                    <div className="icon icon-energy"></div>
                    <div className="info">
                        <FormattedMessage id='TRANSACTIONS.ENERGY' />
                        <span>{account.energyUsed}/{account.energy}</span>
                    </div>
                </div>
            </div>
                :
            null
        )

    }
    renderTokens(account,prices){
        const trx_price = prices.priceList[prices.selected];
        const trx = ["_",{name:"TRX",balance:account.balance,abbr:"TRX",decimals:6,imgUrl:trxImg,price:trx_price}];
        const tokens = {...account.tokens.basic,...account.tokens.smart};
        return (
            <div className="tokens">
                {
                    [trx,...Object.entries(tokens).sort((a,b)=>b[1].balance/Math.pow(10,b[1].decimals) - a[1].balance/Math.pow(10,a[1].decimals))].map(([tokenId,token])=>{
                        const BN = BigNumber.clone({
                            DECIMAL_PLACES: token.decimals,
                            ROUNDING_MODE: Math.min(8, token.decimals)
                        });

                        const amount = new BN(token.balance)
                            .shiftedBy(-token.decimals)
                            .toString();
                            return (
                                <div className="tokenItem" onClick={ ()=>{
                                        if(tokenId.match(/^T/))
                                            return;
                                        PopupAPI.selectTokenId({id:tokenId,name:token.name,decimals:token.decimals});
                                        PopupAPI.changeState(APP_STATE.TRANSACTIONS);
                                    }}>
                                    <img src={token.imgUrl?token.imgUrl:token10DefaultImg} alt=""/>
                                    <div className="name">
                                        {token.name}
                                    </div>
                                    <div className="worth">
                                        <span>{amount}</span>
                                        <span>≈ {tokenId==='_' ?(token.price*amount).toFixed(2):(token.price*amount*trx_price).toFixed(2)} {prices.selected}</span>
                                    </div>
                                </div>
                            )
                    })
                }
            </div>
        )
    }
    render() {
        const { accounts,prices } = this.props;
        return (
            <div className='accountsPage'>
                { accounts.selected.address ? this.renderAccountInfo(accounts,prices):null }
                {/*{ this.renderOptions() }*/}
                <div class="listWrap">
                    { this.renderResource(accounts.accounts[accounts.selected.address]) }
                    <CustomScroll heightRelativeToParent="100%">
                        { this.renderTokens(accounts.selected,prices) }
                    </CustomScroll>
                </div>
            </div>
        );
    }
}

export default injectIntl(
    connect(state => ({
        accounts: state.accounts,
        prices: state.app.prices
    }))(AccountsPage)
);

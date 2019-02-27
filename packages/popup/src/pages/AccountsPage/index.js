import React from 'react';

import CopyToClipboard from 'react-copy-to-clipboard'
import swal from 'sweetalert2';
import Toast,{ T } from 'react-toast-mobile';
import { BigNumber } from 'bignumber.js';
import { PopupAPI } from '@tronlink/lib/api';
import Utils  from '@tronlink/lib/utils';
import Header from '@tronlink/popup/src/controllers/PageController/Header';
import ProcessBar from '@tronlink/popup/src/components/ProcessBar';
import Button from '@tronlink/popup/src/components/Button';
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
import '@tronlink/popup/src/controllers/PageController/Header/Header.scss';

const trxImg = require('@tronlink/popup/src/assets/images/new/trx.png');
const token10DefaultImg = require('@tronlink/popup/src/assets/images/new/token_10_default.png');


class AccountsPage extends React.Component {
    constructor() {
        super();
        this.onClick = this.onClick.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onExport = this.onExport.bind(this);
        this.state = {
            mnemonic:false,
            privateKey:false,
            showAccountList:false,
            showMenuList:false,
            showNodeList:false,
            showBackUp:false,
            showDelete:false
        }
    }
    componentDidMount(){
        const { prices } = this.props;
        const t = {name:'TRX',id:'_',amount:0,decimals:6,price:prices.priceList[prices.selected],imgUrl:trxImg};
        PopupAPI.setSelectedToken(t);
    }
    componentDidUpdate() {

        // const { selected: previous } = prevProps.accounts;
        // const { selected } = this.props.accounts;
        //
        // if(selected.name !== previous.name)
        //     this.props.setSubTitle(selected.name);
    }

    onClick(address) {
        const { selected } = this.props.accounts;

        if(selected.address === address)
            return;

        PopupAPI.selectAccount(address);
    }

    async onDelete() {
        const { formatMessage } = this.props.intl;
        if(Object.keys(this.props.accounts.accounts).length === 1){
            swal(formatMessage({id:'At least one account is required'}),'','warning');
        } else {
            this.setState({
                showDelete:true
            });
        }

    }

    async onExport() {
        const {
            mnemonic,
            privateKey
        } = await PopupAPI.exportAccount();
        this.setState({
            mnemonic,
            privateKey,
            showBackUp:true
        })
    }
    handleShowNodeList(){
        this.setState({
            showAccountList:false,
            showMenuList:false,
            showNodeList:!this.state.showNodeList
        });
    }

    renderAccountInfo(accounts,prices){
        const { formatMessage } = this.props.intl;
        const {showAccountList,showMenuList} = this.state;
        const addresses = Object.entries(accounts.accounts).map(([address,item]) => ({address,name:item.name}));
        const p = (prices.priceList[prices.selected] * (accounts.selected.balance + accounts.selected.frozenBalance) / Math.pow(10,6)).toFixed(2);
        return (
            <div className="accountInfo">
                <div className="row1">
                    <div className="menu" onClick={(e)=>{e.stopPropagation();this.setState({showMenuList:!showMenuList,showAccountList:false,showNodeList:false})}}>
                        <div className="dropList menuList" style={showMenuList?{width:'160px',height:30*3,opacity:1}:{}}>
                            <div onClick={ this.onExport } className="item">
                                <span className="icon backup"></span>
                                <FormattedMessage id="ACCOUNTS.EXPORT" />
                            </div>
                            <div onClick={(e)=>{ e.stopPropagation();window.open("https://tronscan.org/#/account") }} className="item">
                                <span className="icon link"></span>
                                <FormattedMessage id="MENU.ACCOUNT_DETAIL" />
                            </div>
                            {/*<div className="item" onClick={ () => {} }>*/}
                                {/*<span className="icon whitelist"></span>*/}
                                {/*<FormattedMessage id="MENU.WHITE_LIST" />*/}
                            {/*</div>*/}
                            <div className="item" onClick={ () => { this.onDelete() } }>
                                <span className="icon delete"></span>
                                <FormattedMessage id="MENU.DELETE_WALLET" />
                            </div>
                        </div>
                    </div>
                    <div className="accountWrap" onClick={(e)=>{e.stopPropagation();this.setState({showAccountList:!showAccountList,showMenuList:false,showNodeList:false})}}>
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
                            <div className="item gap" onClick={ () => PopupAPI.changeState(APP_STATE.CREATING) }>
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
                    <CopyToClipboard text={accounts.selected.address}
                                    onCopy={() => {T.notify(formatMessage({id:'TOAST.COPY'}))} }>
                        <span className='copy'></span>
                    </CopyToClipboard>

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
                    <div className="title">
                        <FormattedMessage id='CONFIRMATIONS.RESOURCE.BANDWIDTH' />
                        <div className="num">
                            {account.netLimit - account.netUsed}<span>/{account.netLimit}</span>
                        </div>
                    </div>
                    <ProcessBar percentage={(account.netLimit - account.netUsed)/account.netLimit} />
                </div>
                <div className="line"></div>
                <div className="cell">
                    <div className="title">
                        <FormattedMessage id='CONFIRMATIONS.RESOURCE.ENERGY' />
                        <div className="num">
                            {account.energy - account.energyUsed}<span>/{account.energy}</span>
                        </div>
                    </div>
                    <ProcessBar percentage={(account.energy - account.energyUsed)/account.energy} />
                </div>
            </div>
                :
            null
        )

    }
    renderTokens(account,prices){
        BigNumber.config({ EXPONENTIAL_AT: [-20,30] });
        const trx_price = prices.priceList[prices.selected];
        const trx = {tokenId:"_",name:"TRX",balance:(account.balance + account.frozenBalance),abbr:"TRX",decimals:6,imgUrl:trxImg,price:trx_price};
        let tokens = {...account.tokens.basic,...account.tokens.smart};
        tokens = Utils.dataLetterSort(Object.entries(tokens).map(v=>{v[1].tokenId = v[0];return v[1]}),'name');
        return (
            <div className="tokens">
                {
                    [trx,...tokens].map(({tokenId,...token})=>{
                        const amount = new BigNumber(token.balance)
                            .shiftedBy(-token.decimals)
                            .toString();
                            return (
                                <div className="tokenItem" onClick={ ()=>{
                                        let o = {id:tokenId,name:token.name,decimals:token.decimals,amount,price:token.price,imgUrl:token.imgUrl?token.imgUrl:token10DefaultImg};
                                        if(tokenId === '_'){
                                            o.frozenBalance = new BigNumber(account.frozenBalance)
                                                .shiftedBy(-token.decimals)
                                                .toString();
                                            o.balance = new BigNumber(account.balance)
                                                .shiftedBy(-token.decimals)
                                                .toString();
                                        }
                                        PopupAPI.setSelectedToken(o);
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
    renderDeleteAccount(){
        const { showDelete } = this.state;
        const dom = showDelete
                    ?
                    <div className="popUp">
                        <div className="deleteAccount">
                            <div className="title">
                                <FormattedMessage id="ACCOUNTS.CONFIRM_DELETE" />
                            </div>
                            <div className="img"></div>
                            <div className="txt">
                                <FormattedMessage id="ACCOUNTS.CONFIRM_DELETE.BODY" />
                            </div>
                            <div className='buttonRow'>
                                <Button
                                    id='BUTTON.CANCEL'
                                    type={ BUTTON_TYPE.DANGER }
                                    onClick={ () => {this.setState({showDelete:false})} }
                                    tabIndex={ 1 }
                                />
                                <Button
                                    id='BUTTON.CONFIRM'
                                    onClick={()=>{PopupAPI.deleteAccount();this.setState({showDelete:false});}}
                                    tabIndex={ 1 }
                                />
                            </div>
                        </div>
                    </div>
                    :
                    null
        return dom;
    }
    renderBackup(mnemonic,privateKey){
        const { showBackUp } = this.state;
        const dom = showBackUp
                    ?
                    <div className="popUp">
                        <div className="backUp">
                            <div className="title">
                                <FormattedMessage id="ACCOUNTS.EXPORT" />
                            </div>
                            {
                                mnemonic
                                    ?
                                    <div className="option">
                                        <FormattedMessage id="ACCOUNTS.EXPORT.MNEMONIC" />
                                        <div className="block">
                                            {
                                                mnemonic.split(' ').map(v => <div className="cell">{v}</div>)
                                            }
                                        </div>
                                    </div>
                                    :
                                    null
                            }
                            {
                                privateKey
                                    ?
                                    <div className="option" style={{marginBottom:20}}>
                                        <FormattedMessage id="ACCOUNTS.EXPORT.PRIVATE_KEY" />
                                        <div className="block">
                                            { privateKey }
                                        </div>
                                    </div>
                                    :
                                    null
                            }
                            <div className='buttonRow'>
                                <Button
                                    id='BUTTON.CLOSE'
                                    onClick={ () => {this.setState({showBackUp:false})} }
                                    tabIndex={ 1 }
                                />
                            </div>
                        </div>
                    </div>
                    :null

        return dom;
    }
    render() {
        const {showNodeList,mnemonic,privateKey}  = this.state;
        const { accounts,prices,nodes } = this.props;
        return (
            <div className='accountsPage' onClick={()=>{
                this.setState({
                    showAccountList:false,
                    showMenuList:false,
                    showNodeList:false
                })
            }}>
                <Toast />
                {
                    this.renderBackup(mnemonic,privateKey)
                }
                {
                    this.renderDeleteAccount()
                }
                <Header showNodeList={showNodeList} nodes={nodes} handleShowNodeList={this.handleShowNodeList.bind(this)} />
                { accounts.selected.address ? this.renderAccountInfo(accounts,prices):null }
                <div class="listWrap">
                    { this.renderResource(accounts.accounts[accounts.selected.address]) }
                    <div className="scroll">
                        { this.renderTokens(accounts.selected,prices) }
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(
    connect(state => ({
        accounts: state.accounts,
        prices: state.app.prices,
        nodes:state.app.nodes
    }))(AccountsPage)
);

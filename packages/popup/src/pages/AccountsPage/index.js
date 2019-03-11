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
        //PopupAPI.refresh();
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

    renderAccountInfo(accounts,prices,totalMoney){
        const { formatMessage } = this.props.intl;
        const {showAccountList,showMenuList} = this.state;
        const addresses = Object.entries(accounts.accounts).map(([address,item]) => ({address,name:item.name}));
        return (
            <div className="accountInfo">
                <div className="row1">
                    <div className="menu" onClick={(e)=>{e.stopPropagation();this.setState({showMenuList:!showMenuList,showAccountList:false,showNodeList:false})}}>
                        <div className="dropList menuList" style={showMenuList?{width:'160px',height:30*4,opacity:1}:{}}>
                            <div onClick={ ()=>{ PopupAPI.changeState(APP_STATE.ADD_TRC20_TOKEN)} } className="item">
                                <span className="icon addToken"></span>
                                <FormattedMessage id="MENU.ADD_TRC20_TOKEN" />
                            </div>
                            <div onClick={ this.onExport } className="item">
                                <span className="icon backup"></span>
                                <FormattedMessage id="ACCOUNTS.EXPORT" />
                            </div>
                            <div onClick={(e)=>{ e.stopPropagation();window.open("https://tronscan.org/#/account") }} className="item">
                                <span className="icon link"></span>
                                <FormattedMessage id="MENU.ACCOUNT_DETAIL" />
                            </div>
                            <div className="item" onClick={ () => { this.onDelete() } }>
                                <span className="icon delete"></span>
                                <FormattedMessage id="MENU.DELETE_WALLET" />
                            </div>
                        </div>
                    </div>
                    <div className="accountWrap" onClick={(e)=>{e.stopPropagation();this.setState({showAccountList:!showAccountList,showMenuList:false,showNodeList:false})}}>
                        <span>{accounts.selected.name}</span>
                        <div className="dropList accountList" style={showAccountList?{width:'100%',height:30*((addresses.length > 4 ? 4 : addresses.length)+2),opacity:1}:{}}>
                            <div className="accounts">
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
                            </div>
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
                                    onCopy={(e) => { T.notify(formatMessage({id:'TOAST.COPY'}))} }>
                        <span className='copy'></span>
                    </CopyToClipboard>

                </div>
                <div className="row3">
                    ≈ {totalMoney} {prices.selected}
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
    renderTokens(tokens){
        const {prices,accounts} = this.props;
        return (
            <div className="tokens">
                {
                    tokens.map(({tokenId,...token})=>{
                        const amount = new BigNumber(token.balance)
                            .shiftedBy(-token.decimals)
                            .toString();
                            const price = token.price == undefined ? 0 : token.price;
                            const money = tokenId==='_' ?(price * amount).toFixed(2):(price * amount * prices.priceList[prices.selected]).toFixed(2);
                            return (
                                <div className="tokenItem" onClick={ ()=>{
                                        let o = {id:tokenId,name:token.name,decimals:token.decimals,amount,price:token.price,imgUrl:token.imgUrl?token.imgUrl:token10DefaultImg};
                                        if(tokenId === '_'){
                                            o.frozenBalance = new BigNumber(accounts.selected.frozenBalance)
                                                .shiftedBy(-token.decimals)
                                                .toString();
                                            o.balance = new BigNumber(accounts.selected.balance)
                                                .shiftedBy(-token.decimals)
                                                .toString();
                                        }
                                        PopupAPI.setSelectedToken(o);
                                        PopupAPI.changeState(APP_STATE.TRANSACTIONS);
                                    }}>
                                    <img src={token.imgUrl || token10DefaultImg} alt=""/>
                                    <div className="name">
                                        {token.abbr || token.symbol || token.name}
                                    </div>
                                    <div className="worth">
                                        <span>{amount}</span>
                                        <span>≈ {money} {prices.selected}</span>
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
        BigNumber.config({ EXPONENTIAL_AT: [-20,30] });
        let totalMoney = '0';
        const {showNodeList,mnemonic,privateKey}  = this.state;
        const { accounts,prices,nodes } = this.props;
        const trx_price = prices.priceList[prices.selected];
        const trx = {tokenId:"_",name:"TRX",balance:(accounts.selected.balance + (accounts.selected.frozenBalance?accounts.selected.frozenBalance:0)),abbr:"TRX",decimals:6,imgUrl:trxImg,price:trx_price};
        let tokens = {...accounts.selected.tokens.basic,...accounts.selected.tokens.smart};
        tokens = Utils.dataLetterSort(Object.entries(tokens).filter(([tokenId,token])=>typeof token === 'object' ).map(v=>{v[1].tokenId = v[0];return v[1]}).filter(v=> v.balance > 0 || (v.balance == 0 && v.symbol) ),'abbr','symbol');
        tokens = Object.keys(accounts.selected.tokens.basic).includes('_') ? tokens : [trx,...tokens];
        tokens = tokens.map(({tokenId,...token})=>{
            if(tokenId === '_') {
                token.balance += accounts.selected.frozenBalance ? accounts.selected.frozenBalance : 0;
                token.imgUrl = trxImg;
                token.price = trx_price;
            }
            const price = token.price === undefined ? 0 : token.price;
            const amount = new BigNumber(token.balance)
                .shiftedBy(-token.decimals)
                .toString();
            const money = tokenId==='_' ?(price * amount).toFixed(2):(price * amount * trx_price).toFixed(2);
            totalMoney = new BigNumber(totalMoney).plus(new BigNumber(money)).toString();
            return {tokenId,...token};
        });
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
                { accounts.selected.address ? this.renderAccountInfo(accounts,prices,totalMoney):null }
                <div class="listWrap">
                    { this.renderResource(accounts.accounts[accounts.selected.address]) }
                    <div className="scroll">
                        { this.renderTokens(tokens) }
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

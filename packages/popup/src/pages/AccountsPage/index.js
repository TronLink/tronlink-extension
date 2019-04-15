import React from 'react';

import CopyToClipboard from 'react-copy-to-clipboard';
import swal from 'sweetalert2';
import Toast, { T } from 'react-toast-mobile';
import { BigNumber } from 'bignumber.js';
import { PopupAPI } from '@tronlink/lib/api';
import Utils from '@tronlink/lib/utils';
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
let tronscanUrl = '';
class AccountsPage extends React.Component {
    constructor() {
        super();
        this.onClick = this.onClick.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onExport = this.onExport.bind(this);
        this.state = {
            mnemonic: false,
            privateKey: false,
            showMenuList: false,
            showNodeList: false,
            showBackUp: false,
            showDelete: false,
            news: [],
            ieos: []
        };
    }

    async componentDidMount() {
        const { prices } = this.props;
        const t = { name: 'TRX', id: '_', amount: 0, decimals: 6, price: prices.priceList[ prices.selected ], imgUrl: trxImg };
        PopupAPI.setSelectedToken(t);
        const { developmentMode } = this.props.setting;
        tronscanUrl = developmentMode ? 'http://18.188.214.126:8686/#' : 'https://tronscan.org/#';
        const news = await PopupAPI.getNews();
        const ieos = await PopupAPI.getIeos();
        this.setState({ news });
        this.runTime(ieos);
    }

    runTime(ieos) {
        for(const o of ieos) {
            if(o.time >= 0) {
                o.timer = this.getTime(o.time);
                o.time--;
            }
        }
        this.setState({ ieos });
        setTimeout(() => { this.runTime(this.state.ieos); }, 1000);
    }

    getTime(time) {
        const day = Math.floor( time / ( 24 * 60 * 60 ) );
        const hours = Math.floor( time / ( 60 * 60 ) ) - 24 * day;
        const minutes = Math.floor( ( time % ( 60 * 60 ) ) / 60);
        const seconds = Math.floor(time % 60);
        return [hours > 9 ? hours : '0' + hours, minutes > 9 ? minutes: '0'+minutes, seconds > 9 ? seconds: '0' + seconds, day];
    }

    onClick(address) {
        const { selected } = this.props.accounts;

        if(selected.address === address)
            return;

        PopupAPI.selectAccount(address);
    }

    async onDelete() {
        const { formatMessage } = this.props.intl;
        if(Object.keys(this.props.accounts.accounts).length === 1) {
            swal(formatMessage({ id: 'At least one account is required' }), '', 'warning');
        } else {
            this.setState({
                showDelete: true
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
            showBackUp: true
        });
    }

    handleShowNodeList() {
        this.setState({
            showMenuList: false,
            showNodeList: !this.state.showNodeList
        });
    }

    renderAccountInfo(accounts, prices, totalMoney) {
        const { formatMessage } = this.props.intl;
        const { showMenuList } = this.state;
        return (
            <div className='accountInfo'>
                <div className='row1'>
                    <div className='accountWrap' onClick={async (e) => {
                        const setting = await PopupAPI.getSetting();
                        const openAccountsMenu = true;
                        PopupAPI.setSetting({ ...setting, openAccountsMenu });
                    }}
                    >
                        <span>{accounts.selected.name.length > 30 ? accounts.selected.name.substr(0,30)+'...' : accounts.selected.name}</span>
                    </div>
                    <div className='menu' onClick={(e) => { e.stopPropagation();this.setState({ showMenuList: !showMenuList, showNodeList: false }); }}>
                        <div className='dropList menuList' style={ showMenuList ? { width: '160px', height: 30 * 6, opacity: 1 } : {}}>
                            <div onClick={(e) => { e.stopPropagation();window.open(`${tronscanUrl}/account?from=tronlink&type=frozen`); }} className='item'>
                                <span className='icon frozen'></span>
                                <FormattedMessage id='MENU.FROZEN_UNFROZEN' />
                            </div>
                            <div onClick={(e) => { e.stopPropagation();window.open(`${tronscanUrl}/sr/votes?from=tronlink`); }} className='item'>
                                <span className='icon vote'></span>
                                <FormattedMessage id='MENU.VOTE' />
                            </div>
                            <div onClick={ () => { PopupAPI.changeState(APP_STATE.ADD_TRC20_TOKEN); }} className='item'>
                                <span className='icon addToken'></span>
                                <FormattedMessage id='MENU.ADD_TRC20_TOKEN' />
                            </div>
                            <div onClick={ this.onExport } className='item'>
                                <span className='icon backup'></span>
                                <FormattedMessage id='ACCOUNTS.EXPORT' />
                            </div>
                            <div onClick={(e) => { e.stopPropagation();window.open(`${tronscanUrl}/account?from=tronlink`) }} className='item'>
                                <span className='icon link'></span>
                                <FormattedMessage id='MENU.ACCOUNT_DETAIL' />
                            </div>
                            <div className='item' onClick={ () => { this.onDelete(); } }>
                                <span className='icon delete'></span>
                                <FormattedMessage id='MENU.DELETE_WALLET' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row2'>
                    <span>{accounts.selected.address.substr(0,10)+'...'+accounts.selected.address.substr(-10)}</span>
                    <CopyToClipboard text={accounts.selected.address} onCopy={(e) => { T.notify(formatMessage({ id: 'TOAST.COPY' })); }}>
                        <span className='copy'></span>
                    </CopyToClipboard>

                </div>
                <div className='row3'>
                    ≈ {totalMoney} {prices.selected}
                </div>
                <div className='row4'>
                    <div onClick={ () => PopupAPI.changeState(APP_STATE.RECEIVE) }>
                        <span></span>
                        <FormattedMessage id='ACCOUNT.RECEIVE' />
                    </div>
                    <div onClick={ () => PopupAPI.changeState(APP_STATE.SEND) }>
                        <span></span>
                        <FormattedMessage id='ACCOUNT.SEND' />
                    </div>
                </div>
            </div>
        );
    }

    renderResource(account) {
        const { nodes } = this.props;
        return (
            account ?
                <div className='resource'>
                    <div className='cell'>
                        <div className='title'>
                            <FormattedMessage id='CONFIRMATIONS.RESOURCE.BANDWIDTH' />
                            <div className='num'>
                                {account.netLimit - account.netUsed}<span>/{account.netLimit}</span>
                            </div>
                        </div>
                        <ProcessBar percentage={(account.netLimit - account.netUsed) / account.netLimit} />
                    </div>
                    <div className='line'></div>
                    <div className='cell bankSingle'>
                        <div className='title'>
                            {
                                nodes.selected === 'f0b1e38e-7bee-485e-9d3f-69410bf30681' ?
                                    <span className='bankBox' onClick={ () => { PopupAPI.changeState(APP_STATE.TRONBANK); }}>
                                        <FormattedMessage id='CONFIRMATIONS.RESOURCE.ENERGY' />
                                        <img className='bankArrow' src={require('../../assets/images/new/tronBank/rightArrow.svg')} alt='arrow'/>
                                        <div className='bankPopover'>
                                            <div className='popoverTitle'><FormattedMessage id='BANK.INDEX.ENTRANCE' /></div>
                                        </div>
                                    </span> :
                                    <FormattedMessage id='CONFIRMATIONS.RESOURCE.ENERGY' />
                            }
                            <div className='num'>
                                {account.energy - account.energyUsed}<span>/{account.energy}</span>
                            </div>
                        </div>
                        <ProcessBar percentage={(account.energy - account.energyUsed) / account.energy} />
                    </div>
                </div>
                :
                null
        );
    }

    renderIeos(ieos) {
        if(ieos.length === 0)
            return null;
        const { language } = this.props;
        return (
            <div className='ieos'>
                {
                    ieos.map(v => (
                        <div className='ieo' onClick={()=>{window.open(v.ieoUrl)}}>
                            <img src={v.logoUrl} />
                            <div className='name'>{v.name}</div>
                            <div className='worth'>
                                {
                                        v.time + 1 > 0?
                                        <div className='ieo_will'>
                                            {/*<FormattedMessage id='IEOS.LEFT_TIME' values={{day:v.timer[3]}} />*/}
                                                {
                                                    language === 'en'?
                                                        <span>
                                                            {v.timer[3]>1?v.timer[3]+' days until the sale':(v.timer[3] === 1 ? '1 day until the sale': 'until the sale')}
                                                        </span>
                                                        :
                                                        <FormattedMessage id='IEOS.LEFT_TIME' values={{day:(v.timer[3]>0?(language==='zh'?v.timer[3]+'天':v.timer[3]+'日'):'')}} />

                                                }
                                            <div className='time'>
                                                <div className='cell'>{v.timer[0]}</div>
                                                :
                                                <div className='cell'>{v.timer[1]}</div>
                                                :
                                                <div className='cell'>{v.timer[2]}</div>
                                            </div>
                                        </div>
                                        :
                                        <div className='ieo_ing'><FormattedMessage id='IEOS.BUY_ING' /></div>
                                }
                                <div className='launch'>
                                    <FormattedMessage id='IEOS.LAUNCH_BASE' />
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        );
    }

    renderTokens(tokens) {
        const { prices, accounts } = this.props;
        return (
            <div className='tokens'>
                {
                    tokens.map(({ tokenId, ...token }) => {
                        const amount = new BigNumber(token.balance)
                            .shiftedBy(-token.decimals)
                            .toString();
                        const price = token.price === undefined ? 0 : token.price;
                        const money = tokenId === '_' ? (price * amount).toFixed(2) : (price * amount * prices.priceList[ prices.selected ]).toFixed(2);
                        return (
                            <div className='tokenItem' onClick={ ()=>{
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
                                <img src={token.imgUrl || token10DefaultImg} onError={(e)=>{e.target.src=token10DefaultImg}} alt=''/>
                                <div className='name'>
                                    {token.abbr || token.symbol || token.name}
                                </div>
                                <div className='worth'>
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

    renderDeleteAccount() {
        const { showDelete } = this.state;
        const dom = showDelete
            ?
            <div className='popUp'>
                <div className='deleteAccount'>
                    <div className='title'>
                        <FormattedMessage id='ACCOUNTS.CONFIRM_DELETE' />
                    </div>
                    <div className='img'></div>
                    <div className='txt'>
                        <FormattedMessage id='ACCOUNTS.CONFIRM_DELETE.BODY' />
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
            : null;
        return dom;
    }

    renderBackup(mnemonic, privateKey) {
        const { showBackUp } = this.state;
        const dom = showBackUp
            ?
            <div className='popUp'>
                <div className='backUp'>
                    <div className='title'>
                        <FormattedMessage id='ACCOUNTS.EXPORT' />
                    </div>
                    {
                        mnemonic
                            ?
                            <div className='option'>
                                <FormattedMessage id='ACCOUNTS.EXPORT.MNEMONIC' />
                                <div className='block'>
                                    {
                                        mnemonic.split(' ').map(v => <div className='cell'>{v}</div>)
                                    }
                                </div>
                            </div>
                            :
                            null
                    }
                    {
                        privateKey
                            ?
                            <div className='option' style={{marginBottom:20}}>
                                <FormattedMessage id='ACCOUNTS.EXPORT.PRIVATE_KEY' />
                                <div className='block'>
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
            : null;
        return dom;
    }

    render() {
        BigNumber.config({ EXPONENTIAL_AT: [-20, 30] });
        let totalMoney = '0';
        let totalAsset = new BigNumber(0);
        let totalTrx = new BigNumber(0);
        const { showNodeList,mnemonic,privateKey,news,ieos }  = this.state;
        const id = news.length > 0 ? news[0].id : 0;
        const { accounts,prices,nodes,setting,language:lng } = this.props;
        const mode = setting.developmentMode?'developmentMode':'productionMode';
        const { formatMessage } = this.props.intl;
        const trx_price = prices.priceList[prices.selected];
        const trx = {tokenId:'_',name:'TRX',balance:(accounts.selected.balance + (accounts.selected.frozenBalance?accounts.selected.frozenBalance:0)),abbr:'TRX',decimals:6,imgUrl:trxImg,price:trx_price};
        let tokens = {...accounts.selected.tokens.basic,...accounts.selected.tokens.smart};
        tokens = Utils.dataLetterSort(Object.entries(tokens).filter(([tokenId,token])=>typeof token === 'object' ).map(v=>{v[1].tokenId = v[0];return v[1]}).filter(v=> v.balance > 0 || (v.balance == 0 && v.symbol) ),'abbr','symbol');
        tokens = [trx,...tokens];
        tokens = tokens.map(({tokenId,...token})=>{
            token.decimals = token.decimals || 0;
            const price = token.price === undefined ? 0 : token.price;
            const amount = new BigNumber(token.balance)
                .shiftedBy(-token.decimals)
                .toString();
            const money = tokenId==='_' ?(price * amount).toFixed(2):(price * amount * trx_price).toFixed(2);
            totalMoney = new BigNumber(totalMoney).plus(new BigNumber(money)).toString();
            return {tokenId,...token};
        });
        Object.entries(accounts.accounts).map(([address,account])=>{
            totalAsset = totalAsset.plus(new BigNumber(account.asset));
            totalTrx   = totalTrx.plus(new BigNumber(account.balance).shiftedBy(-6));
        });
        return (
            <div className='accountsPage' onClick={()=>{
                this.setState({
                    showMenuList:false
                })
            }}>
                {
                    this.renderBackup(mnemonic,privateKey)
                }
                {
                    this.renderDeleteAccount()
                }
                <Header showNodeList={showNodeList} developmentMode={setting.developmentMode} nodes={nodes} handleShowNodeList={this.handleShowNodeList.bind(this)} />
                <div className='space-controller'>
                    <Toast />
                    {
                        nodes.selected !== 'f0b1e38e-7bee-485e-9d3f-69410bf30681' || !setting.advertising[id] || (setting.advertising[id] && !setting.advertising[id][mode])?
                            null
                            :
                            <div className='advertisingWrap'>
                                <div className='closed' onClick={async () => {
                                    let advertising = setting.advertising ? setting.advertising : {};
                                    advertising[id] = { developmentMode: true, productionMode: true };
                                    advertising[id][mode] = false;
                                    PopupAPI.setSetting({ ...setting, advertising });
                                }}
                                >
                                </div>
                                {
                                    news.map(({ language, ...news }) => {
                                        let l = 1;
                                        switch(lng) {
                                            case 'en':
                                                l = 1;
                                                break;
                                            case 'zh':
                                                l = 2;
                                                break;
                                            case 'ja':
                                                l = 3;
                                                break;
                                            default:
                                                l = 1;
                                        }
                                        return (
                                            language === l ?
                                                <div onClick={async () => {
                                                    const r = await PopupAPI.addCount(news.id);
                                                    if(r)
                                                        window.open(news.content_url);
                                                }}
                                                >
                                                    {news.pic_url ? <img src={news.pic_url} alt=''/> : null}
                                                    {news.content ? <div><span style={{ webkitBoxOrient: 'vertical' }}>{news.content}</span></div> : null}
                                                </div> : null
                                        );
                                    })
                                }
                            </div>
                    }
                    <div className={'accountsWrap' + (setting.openAccountsMenu ? 'show' : '')}>
                        <div className='accounts'>
                            <div className='row1'>
                                <div className='cell' onClick={ () => PopupAPI.changeState(APP_STATE.CREATING) }>
                                    <FormattedMessage id='CREATION.CREATE.TITLE' />
                                </div>
                                <div className='cell' onClick={ () => PopupAPI.changeState(APP_STATE.RESTORING) }>
                                    <FormattedMessage id='CREATION.RESTORE.TITLE' />
                                </div>
                            </div>
                            <div className='row2'>
                                <div className='cell'>
                                    <span>TRX:</span>
                                    <span>{new BigNumber(totalTrx.toFixed(2)).toFormat()}</span>
                                </div>
                                <div className='cell'>
                                    <FormattedMessage id='MENU.ACCOUNTS.TOTAL_ASSET' values={{ sign: ':' }} />
                                    <span>{new BigNumber(totalAsset.multipliedBy(trx_price).toFixed(2)).toFormat()}{ prices.selected }</span>
                                </div>
                            </div>
                            <div className='row3'>
                                {
                                    Object.entries(accounts.accounts).map(([address, account], i) => {
                                        return (
                                            <div className={'cell cell'+ (i%5+1) +(accounts.selected.address === address?' selected':'')} 
                                            onClick={async()=>{
                                                const setting = await PopupAPI.getSetting();
                                                const openAccountsMenu = false;
                                                PopupAPI.setSetting({ ...setting,openAccountsMenu });
                                                if(accounts.selected.address === address)
                                                    return;
                                                PopupAPI.selectAccount(address);
                                            }}>
                                                <div className='top'>
                                                    <div className='name'>
                                                        {account.name.length>30 ? account.name.substr(0,30)+'...' : account.name}
                                                    </div>
                                                    <div className='asset'>
                                                        <span>TRX: { new BigNumber(new BigNumber(account.balance).shiftedBy(-6).toFixed(2)).toFormat() }</span>
                                                        <span><FormattedMessage id='MENU.ACCOUNTS.TOTAL_ASSET' values={{sign:':'}} /> {new BigNumber(new BigNumber(account.asset).multipliedBy(trx_price).toFixed(2)).toFormat()}{ prices.selected }</span>
                                                    </div>
                                                </div>
                                                <div className='bottom'>
                                                    <span>{address.substr(0,10)+'...'+address.substr(-10)}</span>
                                                    <div onClick={(e)=>{e.stopPropagation()}}>
                                                        <CopyToClipboard text={address}
                                                                        onCopy={(e) => {
                                                                            T.notify(formatMessage({id:'TOAST.COPY'}));
                                                                        }}>
                                                            <span className='copy'></span>
                                                        </CopyToClipboard>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                        <div className='closed' onClick={async() => {
                            const setting = await PopupAPI.getSetting();
                            const openAccountsMenu = false;
                            PopupAPI.setSetting({ ...setting, openAccountsMenu });
                        }}
                        >
                        </div>
                    </div>
                    { accounts.selected.address ? this.renderAccountInfo(accounts, prices, totalMoney) : null }
                    <div className='listWrap'>
                        { this.renderResource(accounts.accounts[ accounts.selected.address ]) }
                        { this.renderIeos(ieos) }
                        <div className='scroll' onScroll={(e) => {
                            //const key = index === 0 ? 'all' : ( index === 1 ? 'send':'receive');
                            //if(transactionGroup && transactionGroup[key].length > 8){
                            //    const isTop = e.target.scrollTop === 0 ? false : true;
                            //    this.setState({isTop});
                            //}
                            //}}
                        }}
                        >
                            { this.renderTokens(tokens) }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(
    connect(state => ({
        language: state.app.language,
        accounts: state.accounts,
        prices: state.app.prices,
        nodes: state.app.nodes,
        setting: state.app.setting
    }))(AccountsPage)
);
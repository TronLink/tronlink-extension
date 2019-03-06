import React from 'react';
import moment from 'moment';
import CopyToClipboard from 'react-copy-to-clipboard'
import Toast,{ T } from 'react-toast-mobile';
import { BigNumber } from 'bignumber.js';
import { FormattedMessage,injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import {APP_STATE} from "@tronlink/lib/constants";
BigNumber.config({ EXPONENTIAL_AT: [-20,30] });
class  TransactionsController extends React.Component{
    constructor(props){
        super(props);
        this.state={index :0,isTop:false };
    }
    render() {
        const { index,isTop } = this.state;
        const {
            accounts,
            onCancel,
            prices
        } = this.props;
        const {formatMessage} = this.props.intl;
        const {address} = accounts.selected;
        const {id='_',name='TRX',decimals=6,imgUrl,price = 0,amount,balance,frozenBalance} = accounts.selectedToken;
        const transactionGroup = accounts.selected.transactions[id];
        return (
            <div className='insetContainer transactions'>
                <div className='pageHeader'>
                    <div className="back" onClick={onCancel}></div>
                    <span class="title">{name}</span>
                    {
                    id!=='_'
                        ?
                        <span class="detail" onClick={()=>{
                            let url = 'https://tronscan.org/#/';
                            url+=(id.match(/^T/)?'token20/'+id:'token/'+id);
                            window.open(url);
                        }
                        }>
                                <FormattedMessage  id="TRANSACTION.TOKEN_INFO.DETAIL" />
                        </span>
                        :
                        null
                    }

                </div>
                <div className='greyModal'>
                    <div className="showTokenInfo" style={isTop?{height:0,paddingTop:0}:{height:(id==='_'?216:176)}}>
                        <Toast />
                        <img src={imgUrl} />
                        <div className="amount">
                            {amount}
                        </div>
                        <div className="worth">
                            ≈ {id==='_' ?(price * amount).toFixed(2):(price * amount * prices.priceList[prices.selected]).toFixed(2)} {prices.selected}
                        </div>
                        {
                            id === "_"?
                                <div className="desc trx">
                                    <div className="cell">
                                        <div className="row1">
                                            {balance}
                                        </div>
                                        <div className="row2">
                                            <FormattedMessage id="TRANSACTION.TOKEN_INFO.AVAILABLE_BALANCE" />
                                        </div>
                                    </div>
                                    <div className="cell">
                                        <div className="row1">
                                            {frozenBalance}
                                        </div>
                                        <div className="row2">
                                            <FormattedMessage id="TRANSACTION.TOKEN_INFO.FROZEN_BALANCE" />
                                        </div>
                                    </div>
                                </div>
                                :
                                (
                                    id.match(/^T/)
                                    ?
                                    <div className="desc token">
                                        <FormattedMessage id="TRANSACTION.TOKEN_INFO.CONTRACT" />:&nbsp;
                                        {id.substr(0,7)+'...'+id.substr(-7)}
                                        <CopyToClipboard text={id}
                                                         onCopy={() => {T.notify(formatMessage({id:'TOAST.COPY'}))} }>
                                            <span className='copy'></span>
                                        </CopyToClipboard>
                                    </div>
                                    :
                                    <div className="desc token">ID:&nbsp;{id}</div>
                                )

                        }

                    </div>
                    <div className="tabNav">
                        <div className={index==0?"active":""} onClick={() => {
                            this.setState({index:0});
                        }}>
                            <FormattedMessage id="ACCOUNT.ALL"/>
                        </div>
                        <div className={index==2?"active":""} onClick={() => { this.setState({index:2}) }}>
                            <FormattedMessage id="ACCOUNT.RECEIVE" />
                        </div>
                        <div className={index==1?"active":""} onClick={() => { this.setState({index:1}) }}>
                            <FormattedMessage id="ACCOUNT.SEND"  />
                        </div>
                    </div>
                    <div className="transaction scroll" onScroll={(e)=>{
                        const key = index === 0 ? 'all' : ( index === 1 ? 'send':'receive');
                        if(transactionGroup && transactionGroup[key].length > 8){
                            const isTop = e.target.scrollTop === 0 ? false : true;
                            this.setState({isTop});
                        }
                    }}>
                        {
                            transactionGroup ?
                                Object.entries(transactionGroup).map(([v, transactions], i) =>
                                    <div className="lists" style={i == index ? {display: 'flex'} : {display: 'none'}}>
                                        {
                                            transactions.length > 0 ?
                                                transactions.map(v => {
                                                    const direction = v.transferToAddress === address ? 'receive' : 'send';
                                                    const addr = v.transferToAddress === address ? v.transferFromAddress : v.transferToAddress;
                                                    return (
                                                        <div className={"item " + direction}>
                                                            <div className="left">
                                                                <div className="address">{addr.substr(0, 4) + '...' + addr.substr(-12)}</div>
                                                                <div className="time">{moment(v.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
                                                            </div>
                                                            <div className="right">
                                                                {v.amount / Math.pow(10, decimals)}
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            :
                                            <div className="noData">
                                                <FormattedMessage id="TRANSACTIONS.NO_DATA"  />
                                            </div>
                                        }
                                    </div>
                                )
                                :
                                <div className="noData">
                                    <FormattedMessage id="TRANSACTIONS.NO_DATA"  />
                                </div>
                        }
                        </div>
                </div>
                <div className="buttonGroup">
                    <button className="receive" onClick={ () => PopupAPI.changeState(APP_STATE.RECEIVE) }>
                        <FormattedMessage id="ACCOUNT.RECEIVE"/>
                    </button>
                    <button className="send" onClick={ () => PopupAPI.changeState(APP_STATE.SEND) }>
                        <FormattedMessage id="ACCOUNT.SEND"/>
                    </button>
                </div>
            </div>
        );
    }
}

export default injectIntl(TransactionsController);

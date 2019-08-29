import React from 'react';
import moment from 'moment';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Toast } from 'antd-mobile';
import { BigNumber } from 'bignumber.js';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE, CONTRACT_ADDRESS } from "@tronlink/lib/constants";
BigNumber.config({ EXPONENTIAL_AT: [-20, 30] });
const token10DefaultImg = require('@tronlink/popup/src/assets/images/new/token_10_default.png');
class TransactionsController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            isTop: false,
            transactions: {
                records: [],
                total: 0
            },
            isRequest: false,
            currentPage: 1
        };
    }

    async componentDidMount() {
        const {
            accounts
        } = this.props;
        const { id = "_" } = accounts.selectedToken;
        Toast.loading('', 0, false, false);
        const transactions = await PopupAPI.getTransactionsByTokenId({ tokenId: id });
        this.setState({ transactions });
        Toast.hide();
    }

    render() {
        const { index, isTop, transactions, isRequest, currentPage } = this.state;
        const {
            accounts,
            onCancel,
            prices
        } = this.props;
        const { formatMessage } = this.props.intl;
        const { address, airdropInfo } = accounts.selected;
        const { id = '_', name = 'TRX', decimals = 6, imgUrl, price = 0, amount, balance = 0, frozenBalance = 0 } = accounts.selectedToken;
        return (
            <div className='insetContainer transactions'>
                <div className='pageHeader'>
                    <div className='back' onClick={
                        () => {
                            Toast.hide();
                            onCancel();
                        }}></div>
                    <span className='title'>{name}</span>
                    {
                        id !== '_' ?
                            <span className='detail' onClick={() => {
                                let url = 'https://tronscan.org/#/';
                                url += (id.match(/^T/)? 'token20/'+id:'token/'+id);
                                window.open(url);
                            }
                            }
                            >
                                <FormattedMessage  id='TRANSACTION.TOKEN_INFO.DETAIL' />
                            </span>
                            : null
                    }

                </div>
                <div className='greyModal'>
                    <div className='showTokenInfo' style={ isTop ? { height: 0, paddingTop: 0, overflow: 'hidden' } : { overflow: id === CONTRACT_ADDRESS.USDT ? 'visible' : 'hidden', height: (id === '_' || (id === CONTRACT_ADDRESS.USDT && airdropInfo.isShow) ? 216 : 176) }}>
                        <img src={imgUrl} onError={(e) => e.target.src = token10DefaultImg } />
                        <div className='amount'>
                            {amount}
                        </div>
                        <div className='worth'>
                            ≈ { id === '_' || id === CONTRACT_ADDRESS.USDT ? (price * amount).toFixed(2) : (price * amount * prices.priceList[ prices.selected ]).toFixed(2)} {prices.selected}
                        </div>
                        {
                            id === '_' ?
                                <div className='desc trx'>
                                    <div className='cell'>
                                        <div className='row1'>
                                            {balance}
                                        </div>
                                        <div className='row2'>
                                            <FormattedMessage id='TRANSACTION.TOKEN_INFO.AVAILABLE_BALANCE' />
                                        </div>
                                    </div>
                                    <div className='cell'>
                                        <div className='row1'>
                                            {frozenBalance}
                                        </div>
                                        <div className='row2'>
                                            <FormattedMessage id='TRANSACTION.TOKEN_INFO.FROZEN_BALANCE' />
                                        </div>
                                    </div>
                                </div>
                                :
                                (
                                    id.match(/^T/)
                                        ?
                                        (
                                            id === CONTRACT_ADDRESS.USDT && airdropInfo.isShow ?
                                                <div className='desc usdt'>
                                                    <div className='usdt_inner' onClick={() => PopupAPI.changeState(APP_STATE.USDT_INCOME_RECORD) }>
                                                        <div className='usdt_inner_bg'>
                                                            <div className='cell'>
                                                                <div className='income'>
                                                                    <div className='txt'>
                                                                        <FormattedMessage id='USDT.TEXT.YESTERDAY_INCOME' />
                                                                    </div>
                                                                    <div className='number'>
                                                                        +{new BigNumber(new BigNumber(airdropInfo.yesterdayEarnings).shiftedBy(-6).toFixed(2)).toFormat()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className='cell'>
                                                                <div className='income'>
                                                                    <div className='txt'>
                                                                        <FormattedMessage id='USDT.TEXT.TOTAL_INCOME' />
                                                                    </div>
                                                                    <div className='number'>
                                                                        +{new BigNumber(new BigNumber(airdropInfo.totalEarnings).shiftedBy(-6).toFixed(2)).toFormat()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                :
                                                <div className='desc token'>
                                                    <FormattedMessage id='TRANSACTION.TOKEN_INFO.CONTRACT' />:&nbsp;
                                                    { id.substr(0, 7) + '...' + id.substr(-7) }
                                                    <CopyToClipboard text={id} onCopy={() => { Toast.info(formatMessage({ id: 'TOAST.COPY' })); } }>
                                                        <span className='copy'>&nbsp;</span>
                                                    </CopyToClipboard>
                                                </div>
                                        )
                                        :
                                        <div className='desc token'>
                                            ID:&nbsp;{id}
                                            <CopyToClipboard text={id} onCopy={() => { Toast.info(formatMessage({ id: 'TOAST.COPY' })); } }>
                                                <span className='copy'>&nbsp;</span>
                                            </CopyToClipboard>
                                        </div>
                                )

                        }

                    </div>
                    <div className='tabNav'>
                        <div className={index == 0 ? 'active' : '' } onClick={async () => {
                            this.setState({ index: 0 });
                            Toast.loading('', 0);
                            const transactions = await PopupAPI.getTransactionsByTokenId({ tokenId: id, start: 0, direction: 'all' });
                            Toast.hide();
                            this.setState({ transactions, currentPage: 1, isRequest: false });

                        }}>
                            <FormattedMessage id='ACCOUNT.ALL'/>
                        </div>
                        <div className={ index == 2 ? 'active' : '' } onClick={async () => {
                            this.setState({ index: 2 });
                            Toast.loading('', 0);
                            const transactions = await PopupAPI.getTransactionsByTokenId({ tokenId: id, start: 0, direction: 'from' });
                            Toast.hide();
                            this.setState({ transactions, currentPage: 1, isRequest: false });

                        }}>
                            <FormattedMessage id='ACCOUNT.RECEIVE' />
                        </div>
                        <div className={index == 1 ? 'active' : ''} onClick={async () => {
                            this.setState({ index: 1 }) ;
                            Toast.loading('', 0);
                            const transactions = await PopupAPI.getTransactionsByTokenId({ tokenId: id, start: 0, direction: 'to' });
                            Toast.hide();
                            this.setState({ transactions, currentPage: 1, isRequest: false });
                        }}>
                            <FormattedMessage id='ACCOUNT.SEND' />
                        </div>
                    </div>
                    <div className='transaction scroll' onScroll={async(e) => {
                        const key = index === 0 ? 'all' : ( index === 1 ? 'to' : 'from');
                        if(transactions.records.length > 8) {
                            const isTop = e.target.scrollTop === 0 ? false : true;
                            this.setState({ isTop });
                            if(e.target.scrollTop === ((58 * transactions.records.length + 36) - 484)) {
                                if(!isRequest) {
                                    this.setState({ isRequest: true });
                                    const page = currentPage + 1;
                                    Toast.loading('', 0);
                                    const records = await PopupAPI.getTransactionsByTokenId({ tokenId: id, start: page - 1, direction: key });
                                    Toast.hide();
                                    if(records.records.length === 0) {
                                        this.setState({ isRequest: true });
                                    }else{
                                        transactions.records = transactions.records.concat(records.records);
                                        this.setState({ transactions, currentPage: page, isRequest: false });
                                    }
                                }
                            }
                        }
                    }}
                    >
                        {
                            transactions.records.length > 0 ?
                                <div className='lists'>
                                    {
                                        transactions.records.map((v, transIndex) => {
                                            let callValue = 0;
                                            let direction;
                                            let addr;
                                            if(v.contractData) {
                                                if(v.contractData.call_value) callValue = v.contractData.call_value;
                                                if(v.contractData.amount) callValue = v.contractData.amount;
                                                direction = v.toAddress === v.ownerAddress ? 'send' : (v.toAddress === address ? 'receive' : 'send');
                                                addr = v.ownerAddress === address ? v.toAddress : v.ownerAddress;// trigger => ownerAddress show toAddress
                                            }else{
                                                direction = v.transferToAddress === v.transferFromAddress ? 'send' : (v.transferToAddress === address ? 'receive' : 'send');
                                                addr = v.transferToAddress === address ? v.transferFromAddress : v.transferToAddress;
                                                callValue = v.amount;
                                            }
                                            return (
                                                <div className={`item ${direction}`} key={transIndex} onClick={async() => {
                                                    Toast.loading('', 0);
                                                    await PopupAPI.setTransactionDetail(v.transactionHash || v.hash);
                                                    Toast.hide();
                                                    PopupAPI.changeState(APP_STATE.TRANSACTION_DETAIL);
                                                }}>
                                                    <div className='left'>
                                                        <div className='address'>{`${addr.substr(0, 4)}...${addr.substr(-12)}`}</div>
                                                        <div className='time'>{moment(v.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
                                                    </div>
                                                    <div className='right'>
                                                        {new BigNumber(callValue).shiftedBy(-decimals).toString()}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                                :
                                <div className='noData'>
                                    <FormattedMessage id='TRANSACTIONS.NO_DATA' />
                                </div>
                        }
                    </div>
                </div>
                <div className='buttonGroup'>
                    <button className='receive' onClick={ (e) => {
                        PopupAPI.changeDealCurrencyPage(1);
                        PopupAPI.changeState(APP_STATE.RECEIVE);
                    }}
                    >
                        <FormattedMessage id='ACCOUNT.RECEIVE' />
                    </button>
                    <div className="line">&nbsp;</div>
                    <button className='send' onClick={ (e) => {
                        PopupAPI.changeDealCurrencyPage(1);
                        PopupAPI.changeState(APP_STATE.SEND);
                    }}>
                        <FormattedMessage id='ACCOUNT.SEND'/>
                    </button>
                    <div className="line">&nbsp;</div>
                    <button className='transfer' onClick={ (e) => {
                        PopupAPI.changeDealCurrencyPage(1);
                        PopupAPI.changeState(APP_STATE.TRANSFER);
                    }}>
                        <FormattedMessage id='ACCOUNT.TRANSFER'/>
                    </button>
                </div>
            </div>
        );
    }
}

export default injectIntl(TransactionsController);

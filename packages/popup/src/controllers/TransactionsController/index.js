import React from 'react';
import moment from 'moment';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Toast } from 'antd-mobile';
import { BigNumber } from 'bignumber.js';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE, CONTRACT_ADDRESS, ACCOUNT_TYPE } from '@tronlink/lib/constants';

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
        const { id = '_' } = accounts.selectedToken;
        Toast.loading('', 0, false, false);
        const transactions = await PopupAPI.getTransactionsByTokenId(id);
        this.setState({ transactions });
        Toast.hide();
    }

    render() {
        const { index, isTop, transactions, isRequest, currentPage } = this.state;
        const {
            accounts,
            onCancel,
            prices,
            chains
        } = this.props;
        const { formatMessage } = this.props.intl;
        const { address, airdropInfo, type } = accounts.selected;
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
                                url += (id.match(/^T/) ? 'token20/' + id : 'token/' + id);
                                window.open(url);
                            }
                            }
                            >
                                <FormattedMessage id='TRANSACTION.TOKEN_INFO.DETAIL'/>
                            </span>
                            : null
                    }

                </div>
                <div className='greyModal'>
                    <div className='showTokenInfo' style={isTop ? {
                        height: 0,
                        paddingTop: 0,
                        overflow: 'hidden'
                    } : {
                        overflow: id === CONTRACT_ADDRESS.USDT ? 'visible' : 'hidden',
                        height: (id === '_' || (id === CONTRACT_ADDRESS.USDT && airdropInfo.isShow) ? 216 : 'auto')
                    }}>
                        <img src={imgUrl ? imgUrl : token10DefaultImg}
                             onError={(e) => e.target.src = token10DefaultImg}/>
                        <div className='amount'>
                            {amount}
                        </div>
                        {(id === '_' || id === CONTRACT_ADDRESS.USDT ? (price * amount).toFixed(2) > 0 : (price * amount * prices.priceList[ prices.selected ]).toFixed(2) > 0) &&
                        <div className='worth'>
                            ≈ {id === '_' || id === CONTRACT_ADDRESS.USDT ? (price * amount).toFixed(2) : (price * amount * prices.priceList[ prices.selected ]).toFixed(2)} {prices.selected}
                        </div>
                        }
                        {
                            id === '_' ?
                                <div className='desc trx'>
                                    <div className='cell'>
                                        <div className='row1'>
                                            {balance}
                                        </div>
                                        <div className='row2'>
                                            <FormattedMessage id='TRANSACTION.TOKEN_INFO.AVAILABLE_BALANCE'/>
                                        </div>
                                    </div>
                                    <div className='cell'>
                                        <div className='row1'>
                                            {frozenBalance}
                                        </div>
                                        <div className='row2'>
                                            <FormattedMessage id='TRANSACTION.TOKEN_INFO.FROZEN_BALANCE'/>
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
                                                    <div className='usdt_inner'
                                                         onClick={() => PopupAPI.changeState(APP_STATE.USDT_INCOME_RECORD)}>
                                                        <div className='usdt_inner_bg'>
                                                            <div className='cell'>
                                                                <div className='income'>
                                                                    <div className='txt'>
                                                                        <FormattedMessage
                                                                            id='USDT.TEXT.YESTERDAY_INCOME'/>
                                                                    </div>
                                                                    <div className='number'>
                                                                        +{new BigNumber(new BigNumber(airdropInfo.yesterdayEarnings).shiftedBy(-6).toFixed(2)).toFormat()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className='cell'>
                                                                <div className='income'>
                                                                    <div className='txt'>
                                                                        <FormattedMessage id='USDT.TEXT.TOTAL_INCOME'/>
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
                                                <div></div>
                                        )
                                        :
                                        <div className='desc token'>
                                            ID:&nbsp;{id}
                                            <CopyToClipboard text={id} onCopy={() => {
                                                Toast.info(formatMessage({ id: 'TOAST.COPY' }));
                                            }}>
                                                <span className='copy'>&nbsp;</span>
                                            </CopyToClipboard>
                                        </div>
                                )

                        }

                    </div>
                    <div className='tabNav'>
                        <div className={index == 0 ? 'active' : ''} onClick={async () => {
                            this.setState({ index: 0 });
                            Toast.loading('', 0);
                            const transactions = await PopupAPI.getTransactionsByTokenId(id, '', 'all');
                            Toast.hide();
                            this.setState({ transactions, currentPage: 1, isRequest: false });

                        }}>
                            <FormattedMessage id='ACCOUNT.ALL'/>
                        </div>
                        <div className={index == 2 ? 'active' : ''} onClick={async () => {
                            this.setState({ index: 2 });
                            Toast.loading('', 0);
                            const transactions = await PopupAPI.getTransactionsByTokenId(id, '', 'from');
                            Toast.hide();
                            this.setState({ transactions, currentPage: 1, isRequest: false });

                        }}>
                            <FormattedMessage id='ACCOUNT.RECEIVE'/>
                        </div>
                        <div className={index === 1 ? 'active' : ''} onClick={async () => {
                            this.setState({ index: 1 });
                            Toast.loading('', 0);
                            const transactions = await PopupAPI.getTransactionsByTokenId(id, '', 'to');
                            Toast.hide();
                            this.setState({ transactions, currentPage: 1, isRequest: false });
                        }}>
                            <FormattedMessage id='ACCOUNT.SEND'/>
                        </div>
                    </div>
                    <div className='transaction scroll' onScroll={async (e) => {
                        const key = index === 0 ? 'all' : (index === 1 ? 'to' : 'from');
                        if (transactions.records.length > 8) {
                            const isTop = e.target.scrollTop === 0 ? false : true;
                            this.setState({ isTop });
                            if (e.target.scrollTop === ((58 * transactions.records.length + 36) - 484)) {
                                if (!isRequest) {
                                    this.setState({ isRequest: true });
                                    Toast.loading('', 0);
                                    const records = await PopupAPI.getTransactionsByTokenId(id, typeof transactions.finger === 'string' ? transactions.finger : ++transactions.finger, key);
                                    Toast.hide();
                                    if (records.records.length === 0 || !records.finger) {
                                        this.setState({ isRequest: true });
                                    } else {
                                        transactions.records = transactions.records.concat(records.records);
                                        transactions.finger = records.finger;
                                        this.setState({ transactions, isRequest: false });
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

                                            const direction = v.toAddress === v.fromAddress ? 'send' : (v.toAddress === address ? 'receive' : 'send');
                                            const addr = v.toAddress === address ? v.fromAddress : v.toAddress;

                                            return (
                                                <div className={`item ${direction}`} key={transIndex}
                                                     onClick={async () => {
                                                         Toast.loading('', 0);
                                                         await PopupAPI.setTransactionDetail(v.hash);
                                                         Toast.hide();
                                                         PopupAPI.changeState(APP_STATE.TRANSACTION_DETAIL);
                                                     }}>
                                                    <div className='left'>
                                                        <div
                                                            className='address'>{`${addr.substr(0, 4)}...${addr.substr(-12)}`}</div>
                                                        <div
                                                            className='time'>{moment(v.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
                                                    </div>
                                                    <div className='right'>
                                                        {new BigNumber(v.amount).shiftedBy(-decimals).toString()}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                                :
                                <div className='noData'>
                                    <FormattedMessage id='TRANSACTIONS.NO_DATA'/>
                                </div>
                        }
                    </div>
                </div>
                <div className='buttonGroup'>
                    <button className='receive' onClick={(e) => {
                        PopupAPI.changeDealCurrencyPage(1);
                        PopupAPI.changeState(APP_STATE.RECEIVE);
                    }}
                    >
                        <FormattedMessage id='ACCOUNT.RECEIVE'/>
                    </button>
                    <div className="line">&nbsp;</div>
                    <button className='send' onClick={(e) => {
                        PopupAPI.changeDealCurrencyPage(1);
                        PopupAPI.changeState(APP_STATE.SEND);
                    }}>
                        <FormattedMessage id='ACCOUNT.SEND'/>
                    </button>
                    {
                        accounts.selectedToken.isMapping && type !== ACCOUNT_TYPE.LEDGER ?
                            <div className="line">&nbsp;</div>
                            :
                            null
                    }
                    {
                        accounts.selectedToken.isMapping && type !== ACCOUNT_TYPE.LEDGER ?
                            <button className='transfer' onClick={(e) => {
                                PopupAPI.changeState(APP_STATE.TRANSFER);
                            }}>
                                <FormattedMessage id={'ACCOUNT.TRANSFER' + (chains.selected === '_' ? '' : '2')}/>
                            </button>
                            :
                            null
                    }

                </div>
            </div>
        );
    }
}

export default injectIntl(TransactionsController);

import React from 'react';
import { BigNumber } from 'bignumber.js';
import { FormattedMessage } from 'react-intl';
import { APP_STATE,USDT_ACTIVITY_STAGE  } from "@tronlink/lib/constants";
import { PopupAPI } from '@tronlink/lib/api';
import moment from 'moment';
class IncomeRecordController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    render() {
        const { onCancel,prices } = this.props;
        const { selected,selectedToken } = this.props.accounts;
        const { airdropInfo } = selected;
        const info = USDT_ACTIVITY_STAGE[airdropInfo.stage];
        return (
            <div className='insetContainer transactions'>
                <div className='pageHeader'>
                    <div className="back" onClick={onCancel}></div>
                    <FormattedMessage id="USDT.TEXT.INCOME"/>
                    <span className="detail" onClick={()=>PopupAPI.changeState(APP_STATE.USDT_ACTIVITY_DETAIL)}>
                        <FormattedMessage  id="TRANSACTION.TOKEN_INFO.DETAIL" />
                    </span>
                </div>
                <div className='greyModal'>
                    <div className="incomeRecord">
                        <div className="top">
                            <div className="top_inner">
                                <div>
                                    <div className="row1">
                                        <FormattedMessage id="USDT.TEXT.CURRENT_STAGE" values={info} />
                                    </div>
                                    <div className="row2">
                                        <FormattedMessage id="COMMON.BALANCE" /> {new BigNumber(selectedToken.amount).toFixed(2)} USDT
                                    </div>
                                    <div className="row3">
                                        ≈ {new BigNumber(new BigNumber(selectedToken.amount * selectedToken.price).toFixed(2)).toFormat()} {prices.selected}
                                    </div>
                                </div>
                                <div className="row4">
                                    <div className="cell">
                                        <div className="text">
                                            <FormattedMessage id="USDT.TEXT.YESTERDAY_INCOME" />
                                        </div>
                                        <div className="number">
                                            {new BigNumber(new BigNumber(airdropInfo.yesterdayEarnings).shiftedBy(-6).toFixed(2)).toFormat()}
                                        </div>
                                    </div>
                                    <div className="cell">
                                        <div className="text">
                                            <FormattedMessage id="USDT.TEXT.TOTAL_INCOME" />
                                        </div>
                                        <div className="number">
                                            {new BigNumber(new BigNumber(airdropInfo.totalEarnings).shiftedBy(-6).toFixed(2)).toFormat()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="incomeTitle">
                            <FormattedMessage  id="USDT.TEXT.INCOME_RECORD" />
                        </div>
                        <div className="record scroll">
                            {
                                airdropInfo.data.length === 0
                                    ?
                                    <div className="noData">
                                        <FormattedMessage id="TRANSACTIONS.NO_DATA"  />
                                    </div>
                                    :
                                    airdropInfo.data.map(({amount,timestamp,tokenName})=>(
                                        <div className="item">
                                            <div className="left">
                                                <div className="type">
                                                    <FormattedMessage id="USDT.TEXT.INCOME"  />
                                                </div>
                                                <div className="date">
                                                    {moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}
                                                </div>
                                            </div>
                                            <div className="right">
                                                +{new BigNumber(amount).shiftedBy(-6).toString()} USDT
                                            </div>
                                        </div>
                                    ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default IncomeRecordController;

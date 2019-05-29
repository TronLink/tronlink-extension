/*
 * @Author: lxm
 * @Date: 2019-03-22 10:04:59
 * @Last Modified by: lxm
 * @Last Modified time: 2019-04-28 14:32:35
 * BankOrderDetail
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE } from '@tronlink/lib/constants';
import { NavBar, Toast } from 'antd-mobile';
import Utils from '@tronlink/lib/utils';
import { getBankOrderInfoApi } from '@tronlink/popup/src/fetch/tronLending/tronLending';

import './BankDetailController.scss';

class BankDetailController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: '',
            loading: false,
            orderList: [],
            recordDetail: {}
        };
    }

    componentDidMount() {
        const { selected } = this.props.accounts;
        let requestId;
        if(selected.selectedBankRecordId) requestId = selected.selectedBankRecordId;
        this.getBankRecordDetail(requestId);
    }

    async getBankRecordDetail(_id) {
        Toast.loading();
        const requestUrl = getBankOrderInfoApi();
        const recordDetail = await PopupAPI.getBankRecordDetail(_id, requestUrl);
        const orderList = [
            { id: 'BANK.RENTDETAIL.RENTNUM', type: 0, value: `${recordDetail.freeze_amount / Math.pow(10, 6)}TRX` },
            { id: 'BANK.RENTDETAIL.RENTTIME', type: 2, value: recordDetail.days },
            { id: 'BANK.RENTDETAIL.PAYNUM', type: 0, value: `${recordDetail.pay_amount / Math.pow(10, 6)}TRX` },
            { id: 'BANK.RENTDETAIL.PAYTIME', type: 0, value: Utils.timetransTime(recordDetail.create_time) },
            { id: 'BANK.RENTDETAIL.EXPIRESTIME', type: 0, value: Utils.timetransTime(recordDetail.expire_time) },
        ];
        this.setState({
            recordDetail,
            orderList
        });
        Toast.hide();
    }

    render() {
        const { orderList, recordDetail } = this.state;
        let statusMessage;
        // 生效3 5 6 8   失效:7 单独  0-2 4 处理
        console.log(recordDetail.status);
        if (recordDetail.status > 2 && recordDetail.status !== 7 && recordDetail.status !== 4) {
            statusMessage = (
                <span className='validStatus'>
                    <FormattedMessage id='BANK.RENTRECORD.VALIDNAME'/>
                </span>
            );
        } else if(recordDetail.status === 7) {
            statusMessage = (
                <span className='doneStatus'>
                    <FormattedMessage id='BANK.RENTRECORD.INVALIDNAME'/>
                </span>
            );
        } else if(recordDetail.status < 5 && recordDetail.status !== 3) {
            statusMessage = (
                <span className='validStatus'>
                    <FormattedMessage id='BANK.RENTRECORD.DEALNAME'/>
                </span>
            );
        } else {
            statusMessage = (
                <span className='validStatus'></span>
            );
        }

        return (
            <div className='BankDetailContainer'>
                <NavBar
                    className='navbar'
                    mode='light'
                    icon={<div className='commonBack'></div>}
                    onLeftClick={() => PopupAPI.changeState(APP_STATE.TRONBANK_RECORD)}
                >
                    <FormattedMessage id='BANK.RENTDETAIL.TITLE' />
                </NavBar>
                <section className='detailContent' style={{ padding: '0 18px' }}>
                    <div className='orderList'>
                        <span className='orderIntroduce' >
                            <FormattedMessage id='BANK.RENTDETAIL.STATUS'/>
                        </span>
                        <span className='orderStatus'>
                            <span>
                                {statusMessage}
                            </span>
                        </span>
                    </div>
                    <div className='orderList'>
                        <span className='orderIntroduce' >
                            <FormattedMessage id='BANK.RENTDETAIL.ORDERNUM'/>
                        </span>
                        <span className='orderStatus'>
                            {recordDetail.orderId}
                        </span>
                    </div>
                    <div className='orderAccount'>
                        <div className='accountName' >
                            <FormattedMessage id='BANK.RENTDETAIL.PAYACCOUNT'/>
                        </div>
                        <div className='accountNum'>
                            {recordDetail.pay_address}
                        </div>
                    </div>
                    <div className='orderAccount'>
                        <div className='accountName' >
                            <FormattedMessage id='BANK.RENTDETAIL.TOACCOUNT'/>
                        </div>
                        <div className='accountNum'>
                            {recordDetail.energy_address}
                        </div>
                    </div>
                    {orderList.map((val, key) => (
                        <div key={key} className='orderList' >
                            <span className='orderIntroduce' >
                                <FormattedMessage id={val.id}/>
                            </span>
                            <span className='orderStatus'>
                                <span className='name'>
                                    {val.value}
                                    {val.type === 2 ? <FormattedMessage id='BANK.RENTRECORD.TIMEUNIT'/> : null}
                                </span>
                            </span>
                        </div>
                    ))}
                </section>
            </div>
        );
    }
}

export default injectIntl(BankDetailController);

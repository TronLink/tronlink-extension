/*
 * @Author: lxm
 * @Date: 2019-03-22 10:04:59
 * @Last Modified by: lxm
 * @Last Modified time: 2019-04-02 19:53:42
 * BankOrderDetail
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE } from '@tronlink/lib/constants';
import { NavBar, Toast } from 'antd-mobile';
import Utils from '@tronlink/lib/utils';
import './BankDetailController.scss';

class BankDetailController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: '',
            loading: false,
            orderList: []
        };
    }

    componentDidMount() {
        const { selected } = this.props.accounts;
        let requestId;
        if(selected.selectedBankRecordId) requestId = selected.selectedBankRecordId;
        console.log(`requestId为${requestId}`);
        this.getBankRecordDetail(requestId);
    }

    async getBankRecordDetail(_id) {
        Toast.loading();
        const requestUrl = `${Utils.requestUrl('test')}/api/bank/order_info`;
        console.log(`——id为${_id}`);
        const recordDetail = await PopupAPI.getBankRecordDetail(_id, requestUrl);
        const orderList = [
            { id: 'BANK.RENTDETAIL.STATUS', type: 1, value: recordDetail.status },
            { id: 'BANK.RENTDETAIL.ORDERNUM', type: 0, value: recordDetail.id },
            { id: 'BANK.RENTDETAIL.PAYACCOUNT', type: 0, value: recordDetail.pay_address },
            { id: 'BANK.RENTDETAIL.TOACCOUNT', type: 0, value: recordDetail.energy_address },
            { id: 'BANK.RENTDETAIL.RENTNUM', type: 0, value: `${recordDetail.freeze_amount}TRX` },
            { id: 'BANK.RENTDETAIL.RENTTIME', type: 2, value: recordDetail.days },
            { id: 'BANK.RENTDETAIL.PAYNUM', type: 0, value: `${recordDetail.pay_amount}TRX` },
            { id: 'BANK.RENTDETAIL.PAYTIME', type: 0, value: recordDetail.create_time },
            { id: 'BANK.RENTDETAIL.EXPIRESTIME', type: 0, value: recordDetail.expire_time },
        ];
        this.setState({
            orderList
        });
        Toast.hide();
    }

    render() {
        const { orderList } = this.state;
        // const orderList = [
        //     { id: 'BANK.RENTDETAIL.STATUS', type: 1, value: 1 },
        //     { id: 'BANK.RENTDETAIL.ORDERNUM', type: 0, value: 10111111111111332 },
        //     { id: 'BANK.RENTDETAIL.PAYACCOUNT', type: 0, value: 'TEXABZ889DJHUYFG' },
        //     { id: 'BANK.RENTDETAIL.TOACCOUNT', type: 0, value: 'TEXABZ889DJHUYFG' },
        //     { id: 'BANK.RENTDETAIL.RENTNUM', type: 0, value: '100TRX' },
        //     { id: 'BANK.RENTDETAIL.RENTTIME', type: 2, value: '3' },
        //     { id: 'BANK.RENTDETAIL.PAYNUM', type: 0, value: '0.13TRX' },
        //     { id: 'BANK.RENTDETAIL.PAYTIME', type: 0, value: '2019.01.23 12:34' },
        //     { id: 'BANK.RENTDETAIL.EXPIRESTIME', type: 0, value: '2019.01.23 12:34' }
        // ];
        let statusMessage;
        orderList.map((val, key) => {
        // 有效3 5 6 8   失效:7 单独  0-2 4 处理
            if (val.status > 2 && val.status !== 7 && val.status !== 4) {
                statusMessage = (
                    <span className='validStatus'>
                        <FormattedMessage id='BANK.RENTRECORD.VALIDNAME'/>
                    </span>
                );
            } else if(val.status === 7) {
                statusMessage = (
                    <span className='doneStatus'>
                        <FormattedMessage id='BANK.RENTRECORD.INVALIDNAME'/>
                    </span>
                );
            } else {
                statusMessage = (
                    <span className='validStatus'>
                        <FormattedMessage id='BANK.RENTRECORD.DEALNAME'/>
                    </span>
                );
            }
            return statusMessage;
        });
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
                    {orderList.map((val, key) => (
                        <div key={key} className='orderList' >
                            <span className='orderIntroduce' >
                                <FormattedMessage id={val.id}/>
                            </span>
                            <span className='orderStatus'>
                                {val.id === 'BANK.RENTDETAIL.STATUS' ?
                                    <span>
                                        {statusMessage}
                                    </span> : val.value}
                                {val.type === 2 ? <FormattedMessage id='BANK.RENTRECORD.TIMEUNIT'/> : null}
                            </span>
                        </div>
                    ))}
                </section>
            </div>
        );
    }
}

export default injectIntl(BankDetailController);

/*
 * @Author: lxm
 * @Date: 2019-03-21 18:38:28
 * @Last Modified by: lxm
 * @Last Modified time: 2019-04-17 14:24:11
 * RecordList
 */

import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE } from '@tronlink/lib/constants';
import Utils from '@tronlink/lib/utils';
import './RecordList.scss';

class RecordList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { };
    }

    async toMoreDetail(_id) {
        // PopupAPI
        await PopupAPI.setSelectedBankRecordId(_id);
        PopupAPI.changeState(APP_STATE.TRONBANK_DETAIL);
    }

    render() {
        const recordList = this.props.recordList;
        return(
            <div>
                {recordList.map((val, key) => {
                    let statusMessage;
                    // 有效3 5 6 8   失效:7 单独  0-2  4 处理
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
                            <span className='validStatus dealStatus'>
                                <FormattedMessage id='BANK.RENTRECORD.DEALNAME'/>
                            </span>
                        );
                    }
                    const payMonkey = val.pay_amount / Math.pow(10, 6);
                    return(
                        <div key={ key } className='recordList' onClick={ () => { this.toMoreDetail(val.id); } }>
                            <div className='address'><img src={require('../../../../assets/images/new/tronBank/receive.svg')} alt='receive'/><span>{`${val.energy_address.substr(0, 8)}...${val.energy_address.substr(-8)}`}</span></div>
                            <div className='recordCont'>
                                <section className='recordLeftInfo'>
                                    <div><FormattedMessage id='BANK.RENTRECORD.RENTDETAIL'/>{val.freeze_amount / Math.pow(10, 6)}TRX*{val.days}<FormattedMessage id='BANK.RENTRECORD.TIMEUNIT'/></div>
                                    <div style={{ padding: '4px 0' }}><FormattedMessage id='BANK.RENTRECORD.DEADLINE'/>{Utils.timetransTime(val.expire_time)}</div>
                                    <div className='time'>{Utils.timeFormatTime(val.create_time)}</div>
                                </section>
                                <section className='recordRightInfo'>
                                    <div className='cost'>
                                        <FormattedMessage id='BANK.RENTRECORD.COST'/>
                                        {
                                            String(payMonkey).indexOf('.') > -1 ? payMonkey.toFixed(2) : payMonkey
                                        }TRX
                                    </div>
                                    <div className='recordValStatus'>
                                        { statusMessage }
                                    </div>
                                </section>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default injectIntl(RecordList);
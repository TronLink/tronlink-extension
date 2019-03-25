/*
 * @Author: lxm
 * @Date: 2019-03-21 18:38:28
 * @Last Modified by: lxm
 * @Last Modified time: 2019-03-25 10:54:46
 * RecordList
 */

import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE } from '@tronlink/lib/constants';

import './RecordList.scss';

class RecordList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { };
    }

    render() {
        const recordList = this.props.recordList;
        // const myImg = src => { return require(`../../assets/images/new/tronBank/${src}.svg`); };
        return(
            <div>
                {recordList.map((val, key) => {
                    return(
                        <div key='key' className='recordList' onClick={() => PopupAPI.changeState(APP_STATE.TRONBANK_DETAIL) } >
                            <div className='address'><img src={require('../../assets/images/new/tronBank/receive.svg')} alt='receive'/><span>{`${val.token.substr(0, 4)}...${val.token.substr(-12)}`}</span></div>
                            <div className='recordCont'>
                                <section className='recordLeftInfo'>
                                    <div><FormattedMessage id='BANK.RENTRECORD.RENTDETAIL'/>{val.num}TRX*{val.day}<FormattedMessage id='BANK.RENTRECORD.TIMEUNIT'/></div>
                                    <div style={{ padding: '4px 0' }}><FormattedMessage id='BANK.RENTRECORD.DEADLINE'/>{val.time}</div>
                                    <div className='time'>{val.orderTime}</div>
                                </section>
                                <section className='recordRightInfo'>
                                    <div className='cost'><FormattedMessage id='BANK.RENTRECORD.COST'/>{val.cost}TRX</div>
                                    <div className='recordValStatus'>{val.status === '1' ? <span className='validStatus'><FormattedMessage id='BANK.RENTRECORD.VALIDNAME'/></span> : <span className='doneStatus'><FormattedMessage id='BANK.RENTRECORD.INVALIDNAME'/></span>}</div>
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
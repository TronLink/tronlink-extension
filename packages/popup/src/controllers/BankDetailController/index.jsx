/*
 * @Author: lxm
 * @Date: 2019-03-22 10:04:59
 * @Last Modified by: lxm
 * @Last Modified time: 2019-03-22 17:56:47
 * BankOrderDetail
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE } from '@tronlink/lib/constants';
import { NavBar } from 'antd-mobile';
import './BankDetailController.scss';

class BankDetailController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: '',
            selectedToken: {
                id: '_',
                name: 'TRX',
                amount: 0,
                decimals: 6
            },
            loading: false
        };
    }

    componentDidMount() { // data by props
        // const { selectedToken, selected } = this.props.accounts;
        // selectedToken.amount = selectedToken.id === '_' ? selected.balance / Math.pow(10, 6) : selectedToken.amount;
        // this.setState({ selectedToken });
        // console.log(selectedToken, selected);
    }

    render() {
        const orderList = [
            { id: 'BANK.RENTDETAIL.STATUS', type: 1, value: 1 },
            { id: 'BANK.RENTDETAIL.ORDERNUM', type: 0, value: 10111111111111332 },
            { id: 'BANK.RENTDETAIL.PAYACCOUNT', type: 0, value: 'TEXABZ889DJHUYFG' },
            { id: 'BANK.RENTDETAIL.TOACCOUNT', type: 0, value: 'TEXABZ889DJHUYFG' },
            { id: 'BANK.RENTDETAIL.RENTNUM', type: 0, value: '100TRX' },
            { id: 'BANK.RENTDETAIL.RENTTIME', type: 2, value: '3' },
            { id: 'BANK.RENTDETAIL.PAYNUM', type: 0, value: '0.13TRX' },
            { id: 'BANK.RENTDETAIL.PAYTIME', type: 0, value: '2019.01.23 12:34' },
            { id: 'BANK.RENTDETAIL.EXPIRESTIME', type: 0, value: '2019.01.23 12:34' }
        ];
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
                                {val.id === 'BANK.RENTDETAIL.STATUS' ? <span>{val.value === 1 ? <FormattedMessage id='BANK.RENTRECORD.VALIDNAME'/> : <FormattedMessage id='BANK.RENTRECORD.INVALIDNAME'/>} </span> : val.value}
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


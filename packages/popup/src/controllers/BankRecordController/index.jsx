/*
 * @Author: lxm
 * @Date: 2019-03-21 14:06:13
 * @Last Modified by: lxm
 * @Last Modified time: 2019-03-21 19:27:41
 * BankRecordController
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE } from '@tronlink/lib/constants';
import { NavBar, Tabs } from 'antd-mobile';
import './BankRecodConntroller.scss';
import RecordList from '../../components/RecordList';

class BankRecordController extends React.Component {
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
        const { selectedToken, selected } = this.props.accounts;
        selectedToken.amount = selectedToken.id === '_' ? selected.balance / Math.pow(10, 6) : selectedToken.amount;
        this.setState({ selectedToken });
        console.log(selectedToken, selected);
    }

    render() {
        const recordTabs = [
            { title: <FormattedMessage id='BANK.RENTRECORD.VALID' /> },
            { title: <FormattedMessage id='BANK.RENTRECORD.INVALID' /> },
            { title: <FormattedMessage id='BANK.RENTRECORD.ALLSTATUS' /> },
        ];
        const menuContent = [
            { label: 1 },
            { label: 2 },
            { label: 3 }
        ];
        const recordList = [
            { id: 0, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },
            { id: 1, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 2 },
            { id: 2, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 2 },
            { id: 3, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },
            { id: 4, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },
            { id: 5, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },
            { id: 6, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },
            { id: 7, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },
            { id: 8, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },
            { id: 9, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },
            { id: 10, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },
            { id: 11, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },
            { id: 12, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },
            { id: 13, token: 'TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', num: 10, day: 5, time: '2019.05.07 11:00', cost: 12, orderTime: '2018/09/09  23:12', status: 1 },

        ];
        return (
            <div className='BankRecordContainer'>
                <NavBar
                    className='navbar'
                    mode='light'
                    icon={<div className='commonBack'></div>}
                    onLeftClick={() => PopupAPI.changeState(APP_STATE.TRONBANK)}
                >
                    <FormattedMessage id='BANK.RENTNUMMODAL.RECORD' />
                </NavBar>
                <section className='recordContent'>
                    <Tabs tabs={recordTabs}
                        initialPage={1}
                        tabBarActiveTextColor='#636ACC'
                        tabBarInactiveTextColor='#888998'
                        tabBarUnderlineStyle={{ borderColor: '#636ACC', borderWidth: '1px' }}
                        onChange={(tab, index) => { console.log('onChange', index, tab); }}
                        onTabClick={(tab, index) => { console.log('onTabClick', index, tab); }}
                    >
                        {menuContent.map((val, ind) => {
                            return(
                                <div key={ind} className='rentListContent'>
                                    <RecordList recordList={recordList}></RecordList>
                                </div>
                            );
                        })}
                    </Tabs>
                </section>
            </div>
        );
    }
}

export default injectIntl(BankRecordController);

/*
 * @Author: lxm
 * @Date: 2019-03-21 14:06:13
 * @Last Modified by: lxm
 * @Last Modified time: 2019-04-04 16:10:12
 * BankRecordController
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE } from '@tronlink/lib/constants';
import { NavBar, Tabs, Toast } from 'antd-mobile';
import Utils from '@tronlink/lib/utils';
import './BankRecodConntroller.scss';
import RecordList from './subpage/RecordList';
import LoadMore from './subpage/LoadMore';
class BankRecordController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recordList: [
                // { id: 0, energy_address: 'st1TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 1 },
                // { id: 1, energy_address: 'st2TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 2 },
                // { id: 2, energy_address: 'st3TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 3 },
                // { id: 3, energy_address: 'st4TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 4 },
                // { id: 4, energy_address: 'st5TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 5 },
                // { id: 5, energy_address: 'st6TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 6 },
                // { id: 6, energy_address: 'st7TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 7 },
                // { id: 7, energy_address: 'st8TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 8 },
                // { id: 8, energy_address: 'st9TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 9 },
                // { id: 9, energy_address: 'st8TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 8 },
                // { id: 10, energy_address: 'st7TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 7 },
                // { id: 11, energy_address: 'st6TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 6 },
                // { id: 12, energy_address: 'st5TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 5 },
                // { id: 13, energy_address: 'st4TVTs7Aznrp4NgkzhjAXeK31X3QxKFKwJ4e', freeze_amount: 1000000, days: 5, expire_time: '2019.05.07 11:00', pay_amount: 12000000, create_time: '2018/09/09  23:12', status: 4 },
            ],
            recordListData: [],
            hasMore: false,
            isLoadingMore: false,
            start: 0,
            limit: 8
        };
    }

    componentDidMount() { // data by props
        this.getBankRecordList(0);// index page
    }

    // 加载更多数据
    loadMoreData() {
        // 记录状态
        this.setState({
            isLoadingMore: true
        });
        const { start, limit } = this.state;
        const loadMoreStart = start + limit ;
        this.getBankRecordList(loadMoreStart);

        // 增加 page
        this.setState({
            start: loadMoreStart,
            isLoadingMore: false
        });
    }

    async getBankRecordList(start) {
        Toast.loading();
        const requestUrl = `${Utils.requestUrl('test')}/api/bank/list`;
        const { selected } = this.props.accounts;
        const address = selected.address;
        const { limit } = this.state;
        const json = await PopupAPI.getBankRecordList(
            address,
            limit,
            start,
            requestUrl
        );
        const recordListData = this.state.recordListData.concat(json.data);
        const total = json.total;
        let hasMore;
        if(recordListData.length >= total) hasMore = false; else hasMore = true;
        // const newRecordList = recordListData.filter((item) => { return item.status > 2 && item.status !== 7; });
        this.setState({
            recordListData,
            start,
            hasMore
        });
        Toast.hide();
    }

    // 0-未处理，1-生成冻结交易，2-广播冻结交易， 3-已冻结， 4-冻结失败， 5-生成解冻交易，6-广播解冻交易， 7-已解冻， 8-解冻失败
    // 有效3-6 8   失效:7 单独  0-2 处理
    rentRecordTabChange(tab, ind) {
        console.log(`当前ind是${ind}`);
        const newRecordList = this.state.recordListData;
        // let newRecordList;
        // if(ind == 0)
        //     newRecordList =  recordListData.concat(json.data);
        // // newRecordList = recordListData.filter((item) => { return item.status > 2 && item.status !== 7; });
        // else if(ind == 1)
        //     newRecordList = recordListData;
        // // newRecordList = recordListData.filter((item) => { return item.status === 7; });
        // else
        //     newRecordList = recordListData;
        this.setState({
            recordListData: newRecordList
        });
    }

    render() {
        const recordTabs = [
            { title: <FormattedMessage id='BANK.RENTRECORD.VALID' /> },
            { title: <FormattedMessage id='BANK.RENTRECORD.INVALID' /> },
            { title: <FormattedMessage id='BANK.RENTRECORD.ALLSTATUS' /> },
        ];
        // const menuContent = [
        //     { label: 1 },
        //     { label: 2 },
        //     { label: 3 }
        // ];
        const { recordListData, hasMore, isLoadingMore } = this.state;
        return (
            <div className='bankRecordContainer'>
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
                        initialPage={0}
                        tabBarActiveTextColor='#636ACC'
                        tabBarInactiveTextColor='#888998'
                        tabBarUnderlineStyle={{ borderColor: '#636ACC', borderWidth: '1px' }}
                        onChange={(tab, index) => { console.log('onChange', index, tab); }}
                        onTabClick={(tab, index) => { this.rentRecordTabChange(tab, index); }}
                    >
                        <div className='rentListContent'>
                            {
                                recordListData.length ? <RecordList recordList={ recordListData }/> : null
                            }
                            {
                                hasMore ?
                                    <LoadMore isLoadingMore={ isLoadingMore }
                                        loadMoreFn={this.loadMoreData.bind(this)}
                                    />
                                    : ''
                            }
                        </div>
                        <div className='rentListContent'>
                            {
                                recordListData.length ? <RecordList recordList={ recordListData }/> : null
                            }
                            {
                                hasMore ?
                                    <LoadMore isLoadingMore={ isLoadingMore }
                                        loadMoreFn={this.loadMoreData.bind(this)}
                                    />
                                    : ''
                            }
                        </div>
                        <div className='rentListContent'>
                            {
                                recordListData.length ? <RecordList recordList={ recordListData }/> : null
                            }
                            {
                                hasMore ?
                                    <LoadMore isLoadingMore={ isLoadingMore }
                                        loadMoreFn={this.loadMoreData.bind(this)}
                                    />
                                    : ''
                                    // <span style={{ textAlign: 'center', padding: '10px 0', backgroundColor: '#fff', color: '#999' }}>
                                    //     <FormattedMessage id='BANK.RENTRECORD.NODATE' />
                                    // </span>
                            }
                        </div>
                    </Tabs>
                </section>
            </div>
        );
    }
}

export default injectIntl(BankRecordController);

/*
 * @Author: lxm
 * @Date: 2019-03-21 14:06:13
 * @Last Modified by: lxm
 * @Last Modified time: 2019-04-04 22:37:05
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
            recordList: [],
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
        let hasMore = false;
        console.log(`当前length为${recordListData.length},total为${total}`);
        if(recordListData.length >= total) hasMore = false; else hasMore = true;
        // const newRecordList = recordListData.filter((item) => { return item.status > 2 && item.status !== 7; });
        console.log(`hasMore为${hasMore}`);
        console.log('%O', this.rentListContent);
        this.setState({
            recordListData,
            start,
            hasMore
        });
        console.log(`hasMore为${this.state.hasMore}`);
        Toast.hide();
    }

    // 0-未处理，1-生成冻结交易，2-广播冻结交易， 3-已冻结， 4-冻结失败， 5-生成解冻交易，6-广播解冻交易， 7-已解冻， 8-解冻失败
    // 有效3-6 8   失效:7 单独  0-2 处理
    rentRecordTabChange(tab, ind) {
        console.log(`当前ind是${ind}`);
        this.setState({
            recordListData: []
        });
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
        this.getBankRecordList(0);
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
                    </Tabs>
                    <div className='rentListContent' ref={ ref => this.rentListContentOne = ref }>
                        {
                            recordListData.length ? <RecordList recordList={ recordListData }/> : null
                        }
                        {
                            hasMore ?
                                <LoadMore isLoadingMore={ isLoadingMore }
                                    rentListContentDom ={ this.rentListContentOne }
                                    loadMoreFn={this.loadMoreData.bind(this)}
                                />
                                : ''
                        }
                    </div>
                </section>
            </div>
        );
    }
}

export default injectIntl(BankRecordController);

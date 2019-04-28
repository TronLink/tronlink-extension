/*
 * @Author: lxm
 * @Date: 2019-03-21 14:06:13
 * @Last Modified by: lxm
 * @Last Modified time: 2019-04-28 14:33:12
 * BankRecordController
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE } from '@tronlink/lib/constants';
import { NavBar, Tabs, Toast } from 'antd-mobile';
import { getBankListApi } from '@tronlink/popup/src/fetch/tronLending/tronLending';

import './BankRecodConntroller.scss';
import RecordList from './subpage/RecordList';
import LoadMore from './subpage/LoadMore';
class BankRecordController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recordList: [],
            nodata: false, //isover
            isFoot: true, //prevent Frequent
            recordListData: [],
            hasMore: false,
            isLoadingMore: false,
            start: 0,
            limit: 20,
            type: 1 // 1 valid 2 done 3 all
        };
    }

    componentDidMount() { // data by props
        this.getBankRecordList(0, this.state.type);// index page
    }

    // 加载更多数据
    loadMoreData() {
        // 记录状态
        this.setState({
            isLoadingMore: true
        });
        const { start, limit, type } = this.state;
        const loadMoreStart = start + limit ;
        this.getBankRecordList(loadMoreStart, type);

        // 增加 page
        this.setState({
            start: loadMoreStart,
            isLoadingMore: false
        });
    }

    async getBankRecordList(start, type) {
        Toast.loading();
        const requestUrl = getBankListApi();
        const { selected } = this.props.accounts;
        const address = selected.address;
        const { limit } = this.state;
        const json = await PopupAPI.getBankRecordList(
            address,
            limit,
            start,
            type,
            requestUrl
        );
        let nodata = true;
        const total = json.total;
        if (total === 0) nodata = true; else nodata = false;
        const recordListData = this.state.recordListData.concat(json.data);
        let hasMore = false;
        if(recordListData.length >= total) hasMore = false; else hasMore = true;
        this.setState({
            recordListData,
            start,
            hasMore
        });
        Toast.hide();
        this.setState({
            nodata
        });
    }

    rentRecordTabChange(tab, ind) {
        let type;
        this.setState({
            nodata: false,
            recordListData: []
        });
        if(ind === 0) {
            type = 1;
            this.getBankRecordList(0, 1);
        }
        else if(ind === 1) {
            type = 2;
            this.getBankRecordList(0, 2);
        }
        else{
            type = 0;
            this.getBankRecordList(0, 0);
        }
        this.setState({
            type
        });
    }

    render() {
        const recordTabs = [
            { title: <FormattedMessage id='BANK.RENTRECORD.VALID' /> },
            { title: <FormattedMessage id='BANK.RENTRECORD.INVALID' /> },
            { title: <FormattedMessage id='BANK.RENTRECORD.ALLSTATUS' /> },
        ];
        const { recordListData, hasMore, isLoadingMore, nodata } = this.state;
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
                        {
                            nodata ? <div className='nodata'><FormattedMessage id='BANK.RENTRECORD.NORECORD' /></div> : null
                        }
                    </div>
                </section>
            </div>
        );
    }
}

export default injectIntl(BankRecordController);

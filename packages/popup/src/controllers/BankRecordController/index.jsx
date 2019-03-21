/*
 * @Author: lxm
 * @Date: 2019-03-21 14:06:13
 * @Last Modified by: lxm
 * @Last Modified time: 2019-03-21 16:49:06
 * BankRecordController
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE } from '@tronlink/lib/constants';
import { NavBar, Tabs } from 'antd-mobile';
import './BankRecodConntroller.scss';

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
        // const { selected } = this.props.accounts;
        // const myImg = src => { return require(`../../assets/images/new/tronBank/${src}.svg`); };
        const recordTabs = [
            { title: <FormattedMessage id='BANK.RENTRECORD.VALID' /> },
            { title: <FormattedMessage id='BANK.RENTRECORD.INVALID' /> },
            { title: <FormattedMessage id='BANK.RENTRECORD.ALLSTATUS' /> },
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#fff' }}>
                            Content of first tab
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#fff' }}>
                            Content of second tab
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#fff' }}>
                            Content of third tab
                        </div>
                    </Tabs>
                </section>
            </div>
        );
    }
}

export default injectIntl(BankRecordController);

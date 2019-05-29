import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
class DappListController extends React.Component {
    constructor() {
        super();
        this.state = {
            tab: 'recommend'
        };
    }

    async componentDidMount() {
        const dappList = await PopupAPI.getDappList(true);
        PopupAPI.setDappList(dappList);
    }

    tab(tab) {
        this.setState({ tab });
        if (tab === 'recommend') {
            PopupAPI.setGaEvent('Dapp List','Recommend','Recommend');
        } else {
            PopupAPI.setGaEvent('Dapp List','Used','Used');
        }
    }

    render() {
        const { onCancel, dappList } = this.props;
        const { tab } = this.state;
        const dapps = dappList[ tab ];
        return (
            <div className='insetContainer dapps'>
                <div className='pageHeader'>
                    <div className='back' onClick={onCancel}></div>
                    <span className='title'>DAPP</span>
                </div>
                <div className='greyModal'>
                    <div className='nav'>
                        <div className={'item' + (tab === 'recommend' ? ' focus' : '')} onClick={() => { this.tab('recommend'); }}>
                            <FormattedMessage id='DAPP.NAV.RECOMMEND' />
                        </div>
                        <div className={'item' + (tab === 'used' ? ' focus' : '')} onClick={() => { this.tab('used'); }}>
                            <FormattedMessage id='DAPP.NAV.USED' />
                        </div>
                    </div>
                    <div style={{ display: (tab === 'recommend' ? 'block' : 'none') }} className='dappList scroll'>
                        {
                            dappList.recommend.length > 0
                                ?
                                dappList.recommend.map(( { name, desc, icon, is_plug_hot, href, id } ) => (
                                    <div className='item' onClick={ async () => {
                                        await PopupAPI.setGaEvent('Dapp List', name, 'Recommend', href);
                                        window.open(href);
                                    }} title={ desc } >
                                        <img src={icon} />
                                        <div className='content'>
                                            <div className={ 'title' + (is_plug_hot === "1" ? ' isHot' : '') }>{name}</div>
                                            {desc && desc !== '' ? <div className='desc'>{desc}</div> : null}
                                        </div>
                                    </div>
                                ))
                                :
                                <div className='noData'>
                                    <FormattedMessage id='TRANSACTIONS.NO_DATA'  />
                                </div>
                        }
                    </div>
                    <div style={{ display: (tab === 'used' ? 'block' : 'none') }} className='dappList scroll'>
                        {
                            dappList.used.length > 0
                                ?
                                dapps.map(( { name, icon, href } ) => (
                                    <div className='item' onClick={ async () => {
                                        window.open(href);
                                    }}>
                                        <img src={icon} />
                                        <div className='content'>
                                            <div className='title'>{name}
                                                <div className='delete' onClick={(e)=>{
                                                    e.stopPropagation();
                                                    const n = name;
                                                    const a = dappList.used.filter(({ name }) => name !== n);
                                                    dappList.used = a;
                                                    PopupAPI.setDappList(dappList);
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                :
                                <div className='noData'>
                                    <FormattedMessage id='TRANSACTIONS.NO_DATA'  />
                                </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    address: state.accounts.selected.address,
    dappList: state.app.dappList
}))(DappListController);

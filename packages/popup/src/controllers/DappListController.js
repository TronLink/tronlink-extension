import React from 'react';
import { connect } from 'react-redux';
import Toast,{ T } from 'react-toast-mobile';
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
        T.loading();
        const dappList = await PopupAPI.getDappList();
        PopupAPI.setDappList(dappList);
        T.loaded();
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
        const { onCancel, dappList, address } = this.props;
        const { tab } = this.state;
        const dapps = dappList[ tab ];
        return (
            <div className='insetContainer dapps'>
                <div className='pageHeader'>
                    <div className='back' onClick={onCancel}></div>
                    <span className='title'>DAPP</span>
                </div>
                <div className='greyModal'>
                    <Toast />
                    <div className='nav'>
                        <div className={'item' + (tab === 'recommend' ? ' focus' : '')} onClick={() => { this.tab('recommend'); }}>
                            <FormattedMessage id='DAPP.NAV.RECOMMEND' />
                        </div>
                        <div className={'item' + (tab === 'used' ? ' focus' : '')} onClick={() => { this.tab('used'); }}>
                            <FormattedMessage id='DAPP.NAV.USED' />
                        </div>
                    </div>
                    <div className='dappList scroll'>
                        {
                            dapps.length > 0
                                ?
                                dapps.map(( { name, desc, icon, is_plug_hot, href, id } ) => (
                                    <div className='item' onClick={ async () => {
                                        if(id && tab === 'recommend') await PopupAPI.setGaEvent('Dapp List', name, 'Recommend', href);
                                        window.open(href);
                                    }} title={ desc }>
                                        <img src={icon} />
                                        <div className='content'>
                                            <div className={ 'title' + (is_plug_hot === "1" ? ' isHot' : '') }>{name}{
                                                tab === 'used' ?
                                                    <div className='delete' onClick={(e)=>{
                                                        e.stopPropagation();
                                                        const n = name;
                                                        const a = dappList.used.filter(({ name }) => name !== n);
                                                        dappList.used = a;
                                                        PopupAPI.setDappList(dappList);
                                                    }}></div> : null
                                            }</div>
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
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    address: state.accounts.selected.address,
    dappList: state.app.dappList
}))(DappListController);

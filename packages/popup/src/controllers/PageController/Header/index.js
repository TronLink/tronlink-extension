import React from 'react';
import { injectIntl } from 'react-intl';
import { Toast } from 'antd-mobile';
import ReactTooltip from 'react-tooltip';
import { APP_STATE } from '@tronlink/lib/constants';
import { PopupAPI } from '@tronlink/lib/api';


const logo = require('@tronlink/popup/src/assets/images/new/logo2.svg');


class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            nodeIndex:0,
            //showNodeList:false,
            refresh:false
        }
    }

    componentDidMount() {
    }


    render() {
        const { refresh } = this.state;
        const { formatMessage } = this.props.intl;
        const {
            handleSelectChain,
            showChainList,
            developmentMode,
            chains,
            handleShowChainList
        } = this.props;
        const trxMarketUrl = developmentMode ? 'https://trx.market?from=tronlink' : 'https://trx.market?from=tronlink';
        return (
            <div className='header'>
                <div className='titleContainer'>
                    <div className={'selectedChain '+(chains.selected === '_'?'selected1':'selected2')+(showChainList?' showList':'')} onClick={handleShowChainList}>
                        {/*<img src={logo} alt=""/>*/}
                        <span>{chains.chains[chains.selected].name}</span>
                        <div className='chainWrap' style={showChainList?{height:120,padding:'10px 0'}:{height:0}}>
                            {
                                Object.entries(chains.chains).map(([chainId,{name}])=>{
                                   return <div className='item' onClick={(e)=>{
                                       e.stopPropagation();
                                       handleSelectChain(chainId);
                                   }}>{name}</div>
                                })
                            }
                        </div>
                    </div>
                    <div>
                        <div className="linkWrap">
                            {/*<a href="https://t.me/TronLink" target="_blank" data-tip='telegram' data-for='telegram' className="link link-telegram">&nbsp;</a>*/}
                            {/*<ReactTooltip id='telegram' effect='solid' />*/}
                            <a href="https://www.tronlink.org" target="_blank" data-tip={formatMessage({id:'INDEX_ICON_TITLE.OFFICIAL_WEBSITE'})} data-for="website" className="link link-home">&nbsp;</a>
                            <ReactTooltip id='website' effect='solid' />
                            <a href={trxMarketUrl} target="_blank" data-tip={formatMessage({id:'INDEX_ICON_TITLE.EXCHANGE'})} data-for="exchange" className="link link-exchange">&nbsp;</a>
                            <ReactTooltip id='exchange' effect='solid' />
                        </div>
                        <div className="linkWrap">
                            <a href="javascript:void(0)" data-tip={formatMessage({id:'CREATION.LEDGER.CONNECT_TITLE'})} data-for='ledger' onClick={()=>{
                                PopupAPI.changeState(APP_STATE.LEDGER)
                            }}  className="link link-ledger">&nbsp;</a>
                            <ReactTooltip id='ledger' effect='solid' />
                            <a href="javascript:void(0)" data-tip='Dapp' data-for='dapp' onClick={()=>{
                                PopupAPI.setGaEvent('Dapp List','Recommend','Recommend')
                                PopupAPI.changeState(APP_STATE.DAPP_LIST)
                            }}  className="link link-dapp">&nbsp;</a>
                            <ReactTooltip id='dapp' effect='solid' />
                        </div>
                        <div>
                            <div className="fun" data-tip={formatMessage({id:'INDEX_ICON_TITLE.LOCK'})} data-for='lock' onClick={ () => { PopupAPI.lockWallet(); } }>&nbsp;</div>
                            <ReactTooltip id='lock' effect='solid' />
                            <div className="fun" data-tip={formatMessage({id:'INDEX_ICON_TITLE.REFRESH'})} data-for='refresh' onClick={() => {
                                if(!refresh) {
                                    this.setState({ refresh: true }, async() => {
                                        Toast.loading();
                                        const r = await PopupAPI.refresh();
                                        if(r) {
                                            this.setState({ refresh: false });
                                            Toast.hide();
                                        }
                                    });
                                }

                            }}
                            >&nbsp;</div>
                            <ReactTooltip id='refresh' effect='solid' />
                            <div className="fun" data-tip={formatMessage({id:'INDEX_ICON_TITLE.SETTING'})} data-for='set' onClick={ ()=>{ PopupAPI.changeState(APP_STATE.SETTING) } }>&nbsp;</div>
                            <ReactTooltip id='set' effect='solid' />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(Header);

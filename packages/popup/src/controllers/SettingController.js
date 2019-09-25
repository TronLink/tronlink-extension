import React from 'react';
import { PopupAPI } from "@tronlink/lib/api";
import { FormattedMessage, injectIntl } from 'react-intl';
import { APP_STATE } from '@tronlink/lib/constants';
class SettingController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            languages: [
                { name: 'English', key: 'en', selected: true },
                { name: '中文', key: 'zh', selected: false },
                { name: '日本語', key: 'ja', selected: false },
            ],
            autoLock: [{
                time: 60 * 1000,
                name: 'SETTING.TITLE.AUTO_LOCK.1_MIN'
            }, {
                time: 5 * 60 * 1000,
                name: 'SETTING.TITLE.AUTO_LOCK.5_MIN'
            }, {
                time: 10 * 60 * 1000,
                name: 'SETTING.TITLE.AUTO_LOCK.10_MIN'
            }, {
                time: 30 * 60 * 1000,
                name: 'SETTING.TITLE.AUTO_LOCK.30_MIN'
            }, {
                time: 0,
                name: 'SETTING.TITLE.AUTO_LOCK.NEVER'
            }]
        };
    }

    setting(index) {
        const options = this.refs.cell.getElementsByClassName('option');
        for(let i = 0;i < options.length;i++) {
            if(i === index) {
                options[ index ].classList.toggle('active');
                if(options[ index ].hasAttribute('data-height')) {
                    const height = options[ index ].getAttribute('data-height');
                    if(options[ index ].classList.contains('active')) {
                        options[ index ].getElementsByClassName('settingWrap')[ 0 ].style.height = height + 'px';
                    } else {
                        options[ index ].getElementsByClassName('settingWrap')[ 0 ].style.height = '0px';
                    }
                }
            }else {
                options[ i ].classList.remove('active');
                if(options[ i ].hasAttribute('data-height')) {
                    options[ i ].getElementsByClassName('settingWrap')[ 0 ].style.height = '0px';
                }
            }
        }
    }


    render() {
        const { prices,onCancel,language,lock,version } = this.props;
        const {languages,autoLock} = this.state;
        return (
            <div className='insetContainer choosingType2'>
                <div className='pageHeader'>
                    <div className="back" onClick={ onCancel }>&nbsp;</div>
                    <FormattedMessage id="SETTING.TITLE" />
                </div>
                <div className='greyModal' ref="cell">
                    <div className="optionsWrap">
                        <div className="option" onClick={ ()=>PopupAPI.changeState(APP_STATE.DAPP_WHITELIST) }>
                            <div className="txt">
                                <div className="span">
                                    <FormattedMessage id="SETTING.TITLE.DAPP_WHITELIST" />
                                </div>
                            </div>
                        </div>
                        <div className="option" onClick={ ()=>PopupAPI.changeState(APP_STATE.NODE_MANAGE) }>
                            <div className="txt">
                                <div className="span">
                                    <FormattedMessage id="SETTING.TITLE.NODE_MANAGE" />
                                </div>
                            </div>
                        </div>
                        <div className="option" onClick={ ()=>{this.setting(2)} }>
                            <div className="txt">
                                <div className="span">
                                    <FormattedMessage id="SETTING.TITLE.CURRENCY" />
                                    <div className="unit">{prices.selected}</div>
                                </div>
                                <div className="settingWrap">
                                    {
                                        Object.entries(prices.priceList).filter(([key,val])=>key !== 'USDT').map(([key,val])=><div key={key} onClick={(e)=>{e.stopPropagation();PopupAPI.selectCurrency(key);}} className={"unit"+(key === prices.selected?" selected":"")}>{key} ({val})</div>)
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="option" onClick={ ()=>{this.setting(3)} }>
                            <div className="txt">
                                <div className="span">
                                    <FormattedMessage id="SETTING.TITLE.LANGUAGE" />
                                    <div className="unit">
                                        {
                                            languages.filter(({key})=>key === language)[0].name
                                        }
                                    </div>
                                </div>
                                <div className="settingWrap">
                                    {
                                        languages.map(({name,selected,key})=><div key={name} onClick={(e)=>{e.stopPropagation();PopupAPI.setLanguage(key);}} className={"unit"+(key === language?" selected":"")}>{name}</div>)
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="option" onClick={() =>{this.setting(4)}   }>
                            <div className="txt">
                                <div className="span">
                                    <FormattedMessage id="SETTING.TITLE.AUTO_LOCK" />
                                    <div className="unit">
                                        <FormattedMessage id={autoLock.filter(({time})=>time === lock.duration)[0].name} />
                                    </div>
                                </div>
                                <div className="settingWrap">
                                    {
                                        autoLock.map(({name,time})=>(
                                            <div key={time} onClick={async (e)=>{
                                                e.stopPropagation();
                                                let setting = await PopupAPI.getSetting();
                                                setting.lock={lockTime:new Date().getTime(),duration:time};
                                                PopupAPI.setSetting(setting);
                                            }} className={"unit"+(time === lock.duration ? " selected":"")}>
                                                <FormattedMessage id={name} />
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                        </div>
                        <div className="option" onClick={() =>{PopupAPI.lockWallet()}   }>
                            <div className="txt">
                                <FormattedMessage id="SETTING.TITLE.LOCK" />
                            </div>
                        </div>
                    </div>
                    <div className="version">
                        V{version}
                        {/*<FormattedMessage id="COMMON.CURRENT_VERSION" values={{version}} />*/}
                    </div>
                </div>
            </div>
        );
    }

};

export default injectIntl(SettingController);

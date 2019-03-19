import React from 'react';
import swal from 'sweetalert2';
import { PopupAPI } from '@tronlink/lib/api';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '../components/Button';

import { VALIDATION_STATE } from '@tronlink/lib/constants';
class SettingController extends  React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customNode: {
                name: {
                    value: '',
                    state: VALIDATION_STATE.NONE
                },
                fullNode: {
                    value: '',
                    state: VALIDATION_STATE.NONE
                },
                solidityNode: {
                    value: '',
                    state: VALIDATION_STATE.NONE
                },
                eventServer: {
                    value: '',
                    state: VALIDATION_STATE.NONE
                },
                isValid: false
            },
            languages: [
                { name: 'English', key: 'en', selected: true },
                { name: '中文', key: 'zh', selected: false },
                { name: '日本語', key: 'ja', selected: false },
            ],
            autoLock:[{
                time:60 * 1000,
                name:'SETTING.TITLE.AUTO_LOCK.1_MIN'
            },{
                time:5 * 60 * 1000,
                name:'SETTING.TITLE.AUTO_LOCK.5_MIN'
            },{
                time:10 * 60 * 1000,
                name:'SETTING.TITLE.AUTO_LOCK.10_MIN'
            },{
                time:30 * 60 * 1000,
                name:'SETTING.TITLE.AUTO_LOCK.30_MIN'
            },{
                time:0,
                name:'SETTING.TITLE.AUTO_LOCK.NEVER'
            }]
        };
    }

    setting(index) {
        const options = this.refs.cell.getElementsByClassName('option');
        for(let i=0;i<options.length;i++) {
            if(index === i) {
                if(options[i].className.match(/active/)) {
                    options[i].classList.remove('active');
                }else{
                    options[i].classList.add('active');
                }
            } else {
                options[i].classList.remove('active');
            }
        }
    }

    onCustomNameChange(name) {
        const { nodes } = this.props.nodes;

        name = name.replace(/\s{2,}/g, ' ');

        if(/^\s$/.test(name) || !name.length) {
            return this.setState({
                customNode: {
                    ...this.state.customNode,
                    isValid: false,
                    name: {
                        value: '',
                        state: VALIDATION_STATE.NONE
                    }
                }
            });
        }

        const { customNode } = this.state;
        const nameState = (!Object.values(nodes).some(node => (
            node.name.toLowerCase() === name.trim().toLowerCase()
        )) && name.trim().length >= 4) ?
            VALIDATION_STATE.VALID :
            VALIDATION_STATE.INVALID;

        const isValid =
            nameState === VALIDATION_STATE.VALID &&
            customNode.fullNode.state === VALIDATION_STATE.VALID &&
            customNode.solidityNode.state === VALIDATION_STATE.VALID &&
            customNode.eventServer.state === VALIDATION_STATE.VALID;

        this.setState({
            customNode: {
                ...this.state.customNode,
                name: {
                    state: nameState,
                    value: name
                },
                isValid
            }
        });
    }


    onCustomNodeChange(nodeType, value) {

        if(!value.length) {
            return this.setState({
                customNode: {
                    ...this.state.customNode,
                    isValid: false,
                    [ nodeType ]: {
                        value: '',
                        state: VALIDATION_STATE.NONE
                    }
                }
            });
        }

        const { customNode } = this.state;
        let nodeState = VALIDATION_STATE.INVALID;

        try {
            new URL(value);
            nodeState = VALIDATION_STATE.VALID;
        } catch {}

        customNode[ nodeType ].state = nodeState;

        const isValid =
            customNode.name.state === VALIDATION_STATE.VALID &&
            customNode.fullNode.state === VALIDATION_STATE.VALID &&
            customNode.solidityNode.state === VALIDATION_STATE.VALID &&
            customNode.eventServer.state === VALIDATION_STATE.VALID;

        this.setState({
            customNode: {
                ...this.state.customNode,
                [ nodeType ]: {
                    state: nodeState,
                    value
                },
                isValid
            }
        });
    }

    addCustomNode(e) {
        e.stopPropagation();
        const { formatMessage } = this.props.intl;
        const { customNode } = this.state;
        const name = customNode.name.value.trim();
        const fullNode = customNode.fullNode.value.trim();
        const solidityNode = customNode.solidityNode.value.trim();
        const eventServer = customNode.eventServer.value.trim();

        PopupAPI.addNode({
            name,
            fullNode,
            solidityNode,
            eventServer
        });

        //app.getNodes();
        swal(formatMessage({id:'SETTING.SUCCESS.ADD_NODE'}),'','success');
        this.setState({
            customNode: {
                name: {
                    value: '',
                    state: VALIDATION_STATE.NONE
                },
                fullNode: {
                    value: '',
                    state: VALIDATION_STATE.NONE
                },
                solidityNode: {
                    value: '',
                    state: VALIDATION_STATE.NONE
                },
                eventServer: {
                    value: '',
                    state: VALIDATION_STATE.NONE
                },
                isValid: false
            }
        });
    }

    render() {
        const { prices, onCancel, language, lock} = this.props;
        const { formatMessage } = this.props.intl;
        const {
            name,
            fullNode,
            solidityNode,
            eventServer,
            isValid
        } = this.state.customNode;
        const {languages,autoLock} = this.state;
        return (
            <div className='insetContainer choosingType2'>
                <div className='pageHeader'>
                    <div className="back" onClick={ onCancel }></div>
                    <FormattedMessage id="SETTING.TITLE" />
                </div>
                <div className='greyModal' ref="cell">
                    <div className="option" onClick={ ()=>{this.setting(0)} }>
                        <div className="txt">
                            <div className="span">
                                <FormattedMessage id="SETTING.TITLE.NODE" />
                            </div>
                            <div className="settingWrap">
                                <div className="input-group">
                                    <label>
                                        <FormattedMessage id="SETTINGS.CUSTOM_NODE.NAME" />
                                    </label>
                                    <div className="input">
                                        <input type="text" defaultValue={name.value} placeholder={formatMessage({id:"SETTINGS.CUSTOM_NODE.NAME.PLACEHOLDER"})} onClick={(e)=>{e.stopPropagation()}} onChange={ (e)=>this.onCustomNameChange(e.target.value) }/>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>
                                        <FormattedMessage id="SETTINGS.NODES.FULL_NODE" />
                                    </label>
                                    <div className="input">
                                        <input type="text" defaultValue={fullNode.value} placeholder={formatMessage({id:"SETTINGS.CUSTOM_NODE.FULL_NODE.PLACEHOLDER"})} onClick={(e)=>{e.stopPropagation()}} onChange={ e => this.onCustomNodeChange('fullNode', e.target.value) } />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>
                                        <FormattedMessage id="SETTINGS.NODES.SOLIDITY_NODE" />
                                    </label>
                                    <div className="input">
                                        <input type="text" defaultValue={solidityNode.value} placeholder={formatMessage({id:"SETTINGS.CUSTOM_NODE.SOLIDITY_NODE.PLACEHOLDER"})} onClick={(e)=>{e.stopPropagation()}} onChange={ e => this.onCustomNodeChange('solidityNode', e.target.value) }/>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>
                                        <FormattedMessage id="SETTINGS.NODES.EVENT_SERVER" />
                                    </label>
                                    <div className="input">
                                        <input type="text" defaultValue={eventServer.value} placeholder={formatMessage({id:"SETTINGS.CUSTOM_NODE.EVENT_SERVER.PLACEHOLDER"})} onClick={(e)=>{e.stopPropagation()}} onChange={ e => this.onCustomNodeChange('eventServer', e.target.value) } />
                                    </div>
                                </div>
                                <Button
                                    id='SETTINGS.CUSTOM_NODE'
                                    isValid={ isValid }
                                    onClick={ (e)=>{this.addCustomNode(e)} }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="option" onClick={ ()=>{this.setting(1)} }>
                        <div className="txt">
                            <div className="span">
                                <FormattedMessage id="SETTING.TITLE.CURRENCY" />
                                <div className="unit">{prices.selected}</div>
                            </div>
                            <div className="settingWrap">
                                {
                                    Object.entries(prices.priceList).map(([key,val])=><div key={key} onClick={(e)=>{e.stopPropagation();PopupAPI.selectCurrency(key);}} className={"unit"+(key === prices.selected?" selected":"")}>{key} ({val})</div>)
                                }
                            </div>
                        </div>
                    </div>
                    <div className="option" onClick={ ()=>{this.setting(2)} }>
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
                    <div className="option" onClick={() =>{this.setting(3)}   }>
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
                                        <div key={time} onClick={(e)=>{
                                            e.stopPropagation();
                                            PopupAPI.setSetting({lock:{lockTime:new Date().getTime(),duration:time}});
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
            </div>
        );
    }

};

export default injectIntl(SettingController);

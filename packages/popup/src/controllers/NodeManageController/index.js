import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { VALIDATION_STATE } from "@tronlink/lib/constants";
import Confirmation from '@tronlink/popup/src/components/Confirmation';
import { PopupAPI } from '@tronlink/lib/api';
import { app } from "@tronlink/popup/src";
import Button from '@tronlink/popup/src/components/Button';
import { Toast } from 'antd-mobile';

import './NodeManageController.scss';

class NodeManageController extends React.Component {
    constructor(props){
        super(props);
        this.state={
            showDeleteNodeDialog: false,
            showAddNodeDialog:false,
            selectedChain:'_',
            deleteNodeId:'',
            customNode: {
                name: {
                    value: '',
                    state: VALIDATION_STATE.NONE
                },
                fullNode: {
                    value: 'https://',
                    state: VALIDATION_STATE.NONE
                },
                solidityNode: {
                    value: 'https://',
                    state: VALIDATION_STATE.NONE
                },
                eventServer: {
                    value: 'https://',
                    state: VALIDATION_STATE.NONE
                },
                isValid: false
            },
        }
    }

    componentDidMount(){
        const { chains } = this.props;
        this.setState({selectedChain:chains.selected});
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
        const nameState = name.trim().length <= 4 ? 'EXCEPTION.ADD_NODE.NAME':(Object.values(nodes).some(node => node.name === name.trim())?'EXCEPTION.ADD_NODE.REPEAT_NAME':VALIDATION_STATE.VALID)
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
        } catch(err) {

        }

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

    addCustomNode() {
        const { formatMessage } = this.props.intl;
        const { customNode,selectedChain } = this.state;
        const name = customNode.name.value.trim();
        const fullNode = customNode.fullNode.value.trim();
        const solidityNode = customNode.solidityNode.value.trim();
        const eventServer = customNode.eventServer.value.trim();

        PopupAPI.addNode({
            name,
            fullNode,
            solidityNode,
            eventServer,
            chain:selectedChain,
            isDelete:true
        });
        app.getNodes();
        Toast.success(formatMessage({ id: 'SETTING.SUCCESS.ADD_NODE' }), 3,()=>{
            this.setState({showAddNodeDialog:false});
        },true);
        this.setState({
            customNode: {
                name: {
                    value: '',
                    state: VALIDATION_STATE.NONE
                },
                fullNode: {
                    value: 'https://',
                    state: VALIDATION_STATE.NONE
                },
                solidityNode: {
                    value: 'https://',
                    state: VALIDATION_STATE.NONE
                },
                eventServer: {
                    value: 'https://',
                    state: VALIDATION_STATE.NONE
                },
                isValid: false
            }
        });
    }

    onConfirmed(){
        const { deleteNodeId } = this.state;
        this.setState({showDeleteNodeDialog:false});
        PopupAPI.deleteNode(deleteNodeId);
        app.getNodes();
    }

    onClose(){
        this.setState({showDeleteNodeDialog:false});
    }

    render() {
        const { showDeleteNodeDialog, showAddNodeDialog, selectedChain } = this.state;
        const { name, fullNode, solidityNode, eventServer, isValid } = this.state.customNode;
        const { nodes, chains, onCancel } = this.props;
        const { formatMessage } = this.props.intl;

        return (
            <div className='insetContainer nodeManage'>
                <Confirmation show={showDeleteNodeDialog} onClose={this.onClose.bind(this)} onConfirmed={this.onConfirmed.bind(this)}  />
                {
                    showAddNodeDialog?
                        <div className='addNodeWrap' onClick={()=>this.setState({showAddNodeDialog:false})}>
                            <div className='addNode' onClick={(e)=>e.stopPropagation()}>
                                <label>
                                    <FormattedMessage id="SETTINGS.CUSTOM_NODE.NAME" />
                                </label>
                                <div className="input">
                                    <input type="text" value={name.value} placeholder={formatMessage({id:"SETTINGS.CUSTOM_NODE.NAME.PLACEHOLDER"})} onChange={ (e)=>this.onCustomNameChange(e.target.value) }/>
                                </div>
                                {
                                    !isValid && name.state !== VALIDATION_STATE.VALID && name.state !== VALIDATION_STATE.NONE ? <div className="tipError"><FormattedMessage id={name.state} /></div>:null
                                }
                                <label>
                                    <FormattedMessage id="SETTINGS.NODES.FULL_NODE" />
                                </label>
                                <div className="input">
                                    <input type="text" value={fullNode.value} placeholder={formatMessage({id:"SETTINGS.CUSTOM_NODE.FULL_NODE.PLACEHOLDER"})} onChange={ e => this.onCustomNodeChange('fullNode', e.target.value) } />
                                </div>
                                {
                                    !isValid && fullNode.state === VALIDATION_STATE.INVALID ? <div className="tipError"><FormattedMessage id="EXCEPTION.ADD_NODE.NODE_URL" /></div>:null
                                }
                                <label>
                                    <FormattedMessage id="SETTINGS.NODES.SOLIDITY_NODE" />
                                </label>
                                <div className="input">
                                    <input type="text" value={solidityNode.value} placeholder={formatMessage({id:"SETTINGS.CUSTOM_NODE.SOLIDITY_NODE.PLACEHOLDER"})} onChange={ e => this.onCustomNodeChange('solidityNode', e.target.value) }/>
                                </div>
                                {
                                    !isValid && solidityNode.state === VALIDATION_STATE.INVALID ? <div className="tipError"><FormattedMessage id="EXCEPTION.ADD_NODE.NODE_URL" /></div>:null
                                }
                                <label>
                                    <FormattedMessage id="SETTINGS.NODES.EVENT_SERVER" />
                                </label>
                                <div className="input">
                                    <input type="text" value={eventServer.value} placeholder={formatMessage({id:"SETTINGS.CUSTOM_NODE.EVENT_SERVER.PLACEHOLDER"})} onChange={ e => this.onCustomNodeChange('eventServer', e.target.value) } />
                                </div>
                                {
                                    !isValid && eventServer.state === VALIDATION_STATE.INVALID ? <div className="tipError"><FormattedMessage id="EXCEPTION.ADD_NODE.NODE_URL" /></div>:null
                                }
                                <Button
                                    id='SETTINGS.CUSTOM_NODE'
                                    isValid={ isValid }
                                    onClick={ (e)=>{this.addCustomNode(e)} }
                                />
                            </div>
                        </div>
                        :null
                }
                <div className='pageHeader'>
                    <div className='back' onClick={ () => onCancel() }>&nbsp;</div>
                    <FormattedMessage id='SETTING.TITLE.NODE_MANAGE' />
                    <div className="chains">
                        {chains.chains[selectedChain].name}
                        <div className="chainWrap">
                            {
                                Object.entries(chains.chains).map(([chainId,chain])=><div className="item" onClick={()=>this.setState({selectedChain:chainId})}>{chain.name}</div>)
                            }
                        </div>
                    </div>
                </div>
                <div className='greyModal'>
                    <div className='node scroll'>
                        {
                            Object.entries(nodes.nodes).filter(([nodeId,node])=> node.chain === selectedChain).map(([nodeId, {name, fullNode, solidityNode, eventServer, isDelete = false}])=>{
                                return(
                                    <div className='item' onClick={()=>{
                                        PopupAPI.selectNode(nodeId);
                                        app.getNodes();
                                    }}>
                                        <div className={'r1'+(nodeId === nodes.selected?' selected':'')}>
                                            {name}
                                            {isDelete?<div className='delete' onClick={(e)=>{
                                                e.stopPropagation();
                                                this.setState({deleteNodeId:nodeId,showDeleteNodeDialog:true});
                                            }}>&nbsp;</div>:null}
                                        </div>
                                        <div className='r2'>
                                            <div className='cell'>
                                                <FormattedMessage id="SETTINGS.NODES.FULL_NODE" />
                                                <span>{fullNode}</span>
                                            </div>
                                            <div className='cell'>
                                                <FormattedMessage id="SETTINGS.NODES.SOLIDITY_NODE" />
                                                <span>{solidityNode}</span>
                                            </div>
                                            <div className='cell'>
                                                <FormattedMessage id="SETTINGS.NODES.EVENT_SERVER" />
                                                <span>{eventServer}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    {
                        selectedChain === '_'?
                        <div className='addNode' onClick={() => this.setState({showAddNodeDialog: true})}>
                            <FormattedMessage id="SETTING.TITLE.ADD_NODE"/>
                        </div>:null
                    }
                </div>
            </div>
        )
    }
}

export default injectIntl(NodeManageController);

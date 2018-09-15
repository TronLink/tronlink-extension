import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedRelative, injectIntl } from 'react-intl';
import { popup } from 'index';
import { selectNode, getNodes } from 'reducers/wallet';

import Header from 'components/Header';
import Button from 'components/Button';
import Logger from 'extension/logger';
import Swal from 'sweetalert2';

import './Settings.css';

const logger = new Logger('Settings');

class Settings extends Component {
    state = {
        customNode: {
            full: '',
            solidity: '',
            event: '',
            websocket: '',
            loading: false
        }
    }

    constructor(props) {
        super(props);
        this.translate = props.intl.formatMessage;
    }

    selectNode(nodeHash) {
        logger.info('Requested selection of node', nodeHash);

        popup.setNode(nodeHash).then(() => {
            this.props.selectNode(nodeHash);
        }).catch(err => {
            logger.error(`Failed to set node ${ nodeHash }:`, err);
        });
    }

    async deleteNode(nodeHash) {
        logger.info('Requested deletion of node', nodeHash);

        const result = await Swal({
            type: 'warning',
            title: 'Confirm deletion',
            text: `Are you shure you want to delete ${this.props.wallet.networks[nodeHash].name}?`,
            showCancelButton: true,
            confirmButtonText: this.translate({ id: 'words.confirm' }),
            cancelButtonText: this.translate({ id: 'words.cancel' })
        })

        if(!result.value)
            return;

        popup.deleteNode(nodeHash);
        await getNodes();

        Swal({
            type: 'success',
            text: 'Node successfully deleted'
        });
    }

    renderNodes() {
        const nodes = this.props.wallet.networks;
        const selectedNode = this.props.wallet.selectedNetwork;

        const nodeElements = Object.entries(nodes).map(([ nodeHash, node ]) => (
            <div className='node' key={ nodeHash }>
                <div className='nodeInfo'>
                    <span className='nodeName'>
                        { node.name }
                    </span>
                    <div className='nodeFeatures'>
                        <span className={ 'nodeFeature ' + (node.mainnet ? 'valid' : '') }>
                            Mainnet
                        </span>
                        <span className={ 'nodeFeature ' + (node.websocket ? 'valid' : '') }>
                            Websocket
                        </span>
                    </div>
                </div>
                <div className='nodeStatus'>
                    { nodeHash === selectedNode ? 
                        <span className='nodeLabel active'>Selected</span> :
                        <span className='nodeLabel' onClick={ () => this.selectNode(nodeHash) }>Select Node</span>
                    }
                    { !node.default && <span className='nodeLabel delete' onClick={ () => this.deleteNode(nodeHash) }>Delete</span> }
                </div>
            </div>
        ));

        return (
            <div className='nodeContainer'>
                <div className='nodeList'>
                    { nodeElements }
                </div>
            </div>
        );
    }

    changeCustomNode(nodeType, value) {
        this.setState({
            customNode: {
                ...this.state.customNode,
                [nodeType]: value
            }
        });
    }

    addCustomNode(mainnet = false) {
        this.setState({
            customNode: {
                ...this.state.customNode,
                loading: true
            }
        });

        const { customNode } = this.state;

        popup.addNode({
            name: customNode.name,
            full: customNode.full,
            solidity: customNode.solidity,
            websocket: customNode.websocket.length ? customNode.websocket : false,
            mainnet
        }).then(async () => {
            await getNodes();

            Swal({
                type: 'success',
                title: 'Node successfully added'
            });
        }).catch(error => {
            Swal({
                type: 'error',
                title: 'Failed to add node',
                text: error
            });
        }).then(() => {
            this.setState({
                customNode: {
                    ...this.state.customNode,
                    loading: false
                }
            })
        });
    }

    renderCustomNode() {
        return (
            <div className='customNode'>
                <div className='inputContainer' data-prefix='Node name'>
                    <input 
                        type='text'
                        readOnly={ this.state.customNode.loading }
                        value={ this.state.customNode.name }
                        onChange={ ({ target: { value } }) => this.changeCustomNode('name', value) }
                        placeholder={ this.translate({ id: 'settings.addNode.name' }) } />
                </div>
                <div className='inputContainer' data-prefix='Full node'>
                    <input 
                        type='text'
                        readOnly={ this.state.customNode.loading }
                        value={ this.state.customNode.full }
                        onChange={ ({ target: { value } }) => this.changeCustomNode('full', value) }
                        placeholder={ this.translate({ id: 'settings.addNode.fullNode' }) } />
                </div>
                <div className='inputContainer' data-prefix='Solidity node'>
                    <input 
                        type='text'
                        readOnly={ this.state.customNode.loading }
                        value={ this.state.customNode.solidity }
                        onChange={ ({ target: { value } }) => this.changeCustomNode('solidity', value) }
                        placeholder={ this.translate({ id: 'settings.addNode.solidityNode' }) } />
                </div>
                <div className='inputContainer' data-prefix='Event Server'>
                    <input
                        type='text'
                        readOnly={ this.state.customNode.loading }
                        value={ this.state.customNode.event }
                        onChange={ ({ target: { value } }) => this.changeCustomNode('event', value) }
                        placeholder={ this.translate({ id: 'settings.addNode.event' }) } />
                </div>
                <div className='inputContainer' data-prefix='Web Socket'>
                    <input
                        type='text'
                        readOnly={ this.state.customNode.loading }
                        value={ this.state.customNode.websocket }
                        onChange={ ({ target: { value } }) => this.changeCustomNode('websocket', value) }
                        placeholder={ this.translate({ id: 'settings.addNode.websocket' }) } />
                </div>
                <div className='customNodeButtons'>
                    <Button type='black' loading={ this.state.customNode.loading } onClick={ () => this.addCustomNode(false) }>
                        <FormattedMessage id='settings.addNode.testNet' />
                    </Button>
                    <Button type='primary' loading={ this.state.customNode.loading } onClick={ () => this.addCustomNode(true) }>
                        <FormattedMessage id='settings.addNode.mainNet' />
                    </Button>
                </div>                
            </div>
        )
    }

    renderContent() {
        return (
            <div className="settings">
                <div className="settingsContainer">
                    <div className="settingHeader">
                        <FormattedMessage id='settings.network' />
                    </div>
                    <div className="settingSubHeader">
                        { this.renderNodes() }
                    </div>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">
                        <FormattedMessage id='settings.addNode.title' />
                    </div>
                    <div className="settingSubHeader">
                        { this.renderCustomNode() }
                    </div>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">
                        <FormattedMessage id='settings.price.header' />
                    </div>
                    <div className="settingSubHeader">
                        <FormattedMessage id='settings.price.updated' values={{ 
                            ago: <FormattedRelative value={ this.props.wallet.lastPriceUpdate } /> 
                        }} />
                    </div>
                </div>
                { /* <div className="settingsContainer">
                    <div className="settingHeader">
                        <FormattedMessage id='settings.logs.header' />
                    </div>
                    <Button type='black'>
                        <FormattedMessage id='settings.logs.button' />
                    </Button>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">
                        <FormattedMessage id='settings.wipe.header' />
                    </div>
                    <Button type='black'>
                        <FormattedMessage id='settings.wipe.button' />
                    </Button>
                </div> */ }
            </div>
        );
    }

    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle={ <FormattedMessage id='words.settings' /> }
                />
                <div className="mainContent">
                    { this.renderContent() }
                </div>
            </div>
        );
    }
}

export default injectIntl(
    connect(state => ({
        wallet: state.wallet
    }), dispatch => ({
        selectNode: nodeHash => dispatch(selectNode(nodeHash))
    }))(Settings)
);

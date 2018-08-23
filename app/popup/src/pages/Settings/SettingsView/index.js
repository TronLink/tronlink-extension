import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import { popup } from 'index';
import { selectNode } from 'reducers/wallet';

import Button from 'components/Button';
import Logger from 'extension/logger';

import './Settings.css';

const logger = new Logger('Settings');

class Settings extends Component {
    selectNode(nodeHash) {
        logger.info('Requested select node', nodeHash);

        popup.setNode(nodeHash).then(() => {
            this.props.selectNode(nodeHash);
        }).catch(err => {
            logger.error(`Failed to set node ${ nodeHash }:`, err);
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
                        <span className='nodeLabel' onClick={ () => this.selectNode(nodeHash) }>Select node</span>
                    }
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

    render() {
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
                        <FormattedMessage id='settings.price.header' />
                    </div>
                    <div className="settingSubHeader">
                        <FormattedMessage id='settings.price.updated' values={{ 
                            ago: <FormattedRelative value={ this.props.wallet.lastPriceUpdate } /> 
                        }} />
                    </div>
                </div>
                <div className="settingsContainer">
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
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    wallet: state.wallet
}), dispatch => ({
    selectNode: nodeHash => dispatch(selectNode(nodeHash))
}))(Settings);
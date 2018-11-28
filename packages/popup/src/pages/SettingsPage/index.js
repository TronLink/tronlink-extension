import React from 'react';
import CustomScroll from 'react-custom-scroll';
import Dropdown from 'react-dropdown';
import Button from 'components/Button';
import Input from 'components/Input';

import { VALIDATION_STATE } from '@tronlink/lib/constants';
import { PopupAPI } from '@tronlink/lib/api';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { app } from 'index';

import './SettingsPage.scss';

class SettingsPage extends React.Component {
    state = {
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
    };

    constructor() {
        super();

        this.onPriceChange = this.onPriceChange.bind(this);
        this.onNodeChange = this.onNodeChange.bind(this);
        this.onCustomNameChange = this.onCustomNameChange.bind(this);
        this.onCustomNodeChange = this.onCustomNodeChange.bind(this);
        this.addCustomNode = this.addCustomNode.bind(this);
    }

    onPriceChange({ value }) {
        PopupAPI.selectCurrency(value);
    }

    onNodeChange(nodeID) {
        PopupAPI.selectNode(nodeID);
        app.getNodes();
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
        value = value.trim();

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

    addCustomNode() {
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

        app.getNodes();

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

    renderPrices() {
        const {
            priceList,
            selected
        } = this.props.prices;

        const options = Object.entries(priceList).map(([ currency, price ]) => ({
            value: currency,
            label: `${ currency } (${ Number(price).toLocaleString(undefined, { maximumFractionDigits: 8 }) } ${ currency })`
        }));

        const [ value ] = options.filter(option => option.value === selected);

        return (
            <Dropdown
                className='dropdown'
                options={ options }
                value={ value }
                onChange={ this.onPriceChange }
            />
        );
    }

    renderNodes() {
        const {
            nodes,
            selected
        } = this.props.nodes;

        return Object.entries(nodes).map(([ nodeID, node ]) => (
            <div
                className={ `node ${ selected === nodeID ? 'selected' : '' }` }
                onClick={ () => this.onNodeChange(nodeID) }
                key={ nodeID }
            >
                <div className='name'>
                    { node.name }
                </div>
                <div className='meta'>
                    <div className='metaLine'>
                        <FormattedMessage id='SETTINGS.NODES.FULL_NODE' />
                        <span className='value'>
                            { node.fullNode }
                        </span>
                    </div>
                    <div className='metaLine'>
                        <FormattedMessage id='SETTINGS.NODES.SOLIDITY_NODE' />
                        <span className='value'>
                            { node.solidityNode }
                        </span>
                    </div>
                    <div className='metaLine'>
                        <FormattedMessage id='SETTINGS.NODES.EVENT_SERVER' />
                        <span className='value'>
                            { node.eventServer }
                        </span>
                    </div>
                </div>
            </div>
        ));
    }

    renderCustomNode() {
        const {
            name,
            fullNode,
            solidityNode,
            eventServer,
            isValid
        } = this.state.customNode;

        return (
            <div className='inputContainers'>
                <div className='inputContainer'>
                    <FormattedMessage id='SETTINGS.CUSTOM_NODE.NAME' />
                    <Input
                        value={ name.value }
                        placeholder='SETTINGS.CUSTOM_NODE.NAME.PLACEHOLDER'
                        status={ name.state }
                        onChange={ this.onCustomNameChange }
                    />
                </div>
                <div className='inputContainer'>
                    <FormattedMessage id='SETTINGS.CUSTOM_NODE.FULL_NODE' />
                    <Input
                        value={ fullNode.value }
                        placeholder='SETTINGS.CUSTOM_NODE.FULL_NODE.PLACEHOLDER'
                        status={ fullNode.state }
                        onChange={ value => this.onCustomNodeChange('fullNode', value) }
                    />
                </div>
                <div className='inputContainer'>
                    <FormattedMessage id='SETTINGS.CUSTOM_NODE.SOLIDITY_NODE' />
                    <Input
                        value={ solidityNode.value }
                        placeholder='SETTINGS.CUSTOM_NODE.SOLIDITY_NODE.PLACEHOLDER'
                        status={ solidityNode.state }
                        onChange={ value => this.onCustomNodeChange('solidityNode', value) }
                    />
                </div>
                <div className='inputContainer'>
                    <FormattedMessage id='SETTINGS.CUSTOM_NODE.EVENT_SERVER' />
                    <Input
                        value={ eventServer.value }
                        placeholder='SETTINGS.CUSTOM_NODE.EVENT_SERVER.PLACEHOLDER'
                        status={ eventServer.state }
                        onChange={ value => this.onCustomNodeChange('eventServer', value) }
                    />
                </div>
                <Button
                    id='BUTTON.ADD_NODE'
                    isValid={ isValid }
                    onClick={ this.addCustomNode }
                />
            </div>
        );
    }

    render() {
        return (
            <div className='settingsPage'>
                <CustomScroll heightRelativeToParent='100%'>
                    <div className='priceList hasBottomMargin'>
                        <FormattedMessage id='SETTINGS.PRICES' />
                        { this.renderPrices() }
                    </div>
                    <div className='nodeList'>
                        <FormattedMessage id='SETTINGS.NODES' />
                        <div className='nodeContainer'>
                            <CustomScroll heightRelativeToParent='100%'>
                                { this.renderNodes() }
                            </CustomScroll>
                        </div>
                    </div>
                    <div className='customNode'>
                        <FormattedMessage id='SETTINGS.CUSTOM_NODE' />
                        { this.renderCustomNode() }
                    </div>
                </CustomScroll>
            </div>
        );
    }
}

export default connect(state => ({
    nodes: state.app.nodes,
    prices: state.app.prices
}))(SettingsPage);
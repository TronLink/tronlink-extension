import StorageService from '../StorageService';
import randomUUID from 'uuid/v4';
import TronWeb from 'tronweb';
import SunWeb from 'sunweb';
import Logger from '@tronlink/lib/logger';
import { CONTRACT_ADDRESS, SIDE_CHAIN_ID, NODE, SIDE_CHAIN_ID_TEST } from '@tronlink/lib/constants';
import { BigNumber } from 'bignumber.js';

const logger = new Logger('NodeService');

const NodeService = {
    _chains: {
        '_': {
            name: 'TRON',
            default: true
        },
        [SIDE_CHAIN_ID]: {
            name: 'DAppChain',
            default: false
        }
    },
    _nodes: {
        '3672f655-68a1-5c62-8929-d151c90ac21d': {
            name: 'Mainnet',
            fullNode: 'https://api.trongrid.io',
            solidityNode: 'https://api.trongrid.io',
            eventServer: 'https://api.trongrid.io',
            default: true, // false
            chain: '_',
            connect: '9dd662e3-052c-584d-9a13-df395a0d68f6'
        },
        'bb99520f-d86e-5722-92a3-e0bcbe409b3f': {
            name: 'Shasta Testnet',
            fullNode: 'https://api.shasta.trongrid.io',
            solidityNode: 'https://api.shasta.trongrid.io',
            eventServer: 'https://api.shasta.trongrid.io',
            default: false,
            chain: '_',
        },
        '9670cbd2-5289-57df-82c2-1c80b6bd8511': {
            name: 'DappChain Testnet',
            fullNode: 'https://testhttpapi.tronex.io',
            solidityNode: 'https://testhttpapi.tronex.io',
            eventServer: 'https://testapi.tronex.io',
            default: false,
            chain: '_',
            connect: '89895c8f-d355-5533-b9b3-d63f2408af7e'
        },
        '9dd662e3-052c-584d-9a13-df395a0d68f6': {
            name: 'DappChain',
            fullNode: 'https://sun.tronex.io',
            solidityNode: 'https://sun.tronex.io',
            eventServer: 'https://sun.tronex.io',
            default: true,
            chain: SIDE_CHAIN_ID,
            connect: '3672f655-68a1-5c62-8929-d151c90ac21d',
        },
        '89895c8f-d355-5533-b9b3-d63f2408af7e': {
            name: 'DappChain Testnet',
            fullNode: 'https://suntest.tronex.io',
            solidityNode: 'https://suntest.tronex.io',
            eventServer: 'https://suntest.tronex.io',
            default: false,
            chain: SIDE_CHAIN_ID,
            connect: '9670cbd2-5289-57df-82c2-1c80b6bd8511',
        },

    },
    _selectedChain: '_',
    _selectedNode: '3672f655-68a1-5c62-8929-d151c90ac21d',
    _read() {
        logger.info('Reading nodes and chains from storage');

        const {
            chainList = {},
            selectedChain = false
        } = StorageService.chains;
        this._chains = { ...this._chains, ...chainList };

        const {
            nodeList = {},
            selectedNode = false
        } = StorageService.nodes;

        this._nodes = {
            ...this._nodes,
            ...nodeList,
        };

        let temp = {};

        Object.keys(this._nodes).forEach((id) => {

            if (Object.keys(temp).length === 0) {
                temp[id] = this._nodes[id];
            }

            let flag = false;

            Object.keys(temp).forEach((_id) => {

                if (temp[_id].fullNode === this._nodes[id].fullNode) {
                    flag = true;
                }

            });

            if (!flag) {
                temp[id] = this._nodes[id];
            }

        });

        this._nodes = temp;

        if (selectedChain) {
            this._selectedChain = selectedChain;
        }

        if (selectedNode) {
            this._selectedNode = selectedNode;
        }
    },

    init() {
       // this._read();
        this._updateTronWeb();
    },

    _updateTronWeb(skipAddress = false) {
        const {
            fullNode,
            solidityNode,
            eventServer
        } = this.getCurrentNode();

        this.sunWeb = new SunWeb(
            //{fullNode:'https://api.trongrid.io',solidityNode:'https://api.trongrid.io',eventServer:'https://api.trongrid.io'},
            //{fullNode:'https://sun.tronex.io',solidityNode:'https://sun.tronex.io',eventServer:'https://sun.tronex.io'},
            NODE.MAIN,
            NODE.SIDE,
            CONTRACT_ADDRESS.MAIN,
            CONTRACT_ADDRESS.SIDE,
            SIDE_CHAIN_ID
        );

        this.tronWeb = new TronWeb(
            fullNode,
            solidityNode,
            eventServer
        );
        if (!skipAddress) {
            this.setAddress();
        }
    },

    setAddress() {
        if (!this.tronWeb) {
            this._updateTronWeb();
        }

        if (!StorageService.selectedAccount) {
            return this._updateTronWeb(true);
        }

        this.tronWeb.setAddress(
            StorageService.selectedAccount
        );
    },

    save() {

        Object.entries(this._nodes).forEach(([nodeID, node]) => (
            StorageService.saveNode(nodeID, node)
        ));

        Object.entries(this._chains).forEach(([chainId, chain]) => {
            StorageService.saveChain(chainId, chain);
        });

        StorageService.selectChain(this._selectedChain);
        StorageService.selectNode(this._selectedNode);
        this._updateTronWeb();
    },

    getNodes() {
        return {
            nodes: this._nodes,
            selected: this._selectedNode
        };
    },

    getChains() {
        return {
            chains: this._chains,
            selected: this._selectedChain
        };
    },

    getCurrentNode() {
        return this._nodes[this._selectedNode];
    },

    selectNode(nodeID) {
        StorageService.selectNode(nodeID);

        this._selectedNode = nodeID;
        this._updateTronWeb();
    },

    deleteNode(nodeID) {
        StorageService.deleteNode(nodeID);
        delete this._nodes[nodeID];
        if (nodeID === this._selectedNode) {
            const nodeId = Object.entries(this._nodes).filter(([nodeId, node]) => node.default && node.chain === this._selectedChain)[0][0];
            this.selectNode(nodeId);
            return nodeId;
        } else {
            return false;
        }
    },

    selectChain(chainId) {
        StorageService.selectChain(chainId);
        this._selectedChain = chainId;
        this._updateTronWeb();
    },

    addNode(node) {
        const nodeID = randomUUID();

        this._nodes[nodeID] = {
            ...node,
            default: false
        };
        this.save();
        return nodeID;
    },

    async getSmartToken(address) {
        try {
            let balance;
            const contract = await this.tronWeb.contract().at(address);
            if (!contract.name && !contract.symbol && !contract.decimals) {
                return false;
            }
            const d = await contract.decimals().call();
            const name = await contract.name().call();
            const symbol = await contract.symbol().call();
            const decimals = typeof d === 'object' && d._decimals ? d : new BigNumber(d).toNumber();
            const number = await contract.balanceOf(address).call();
            if (number.balance) {
                balance = new BigNumber(number.balance).toString();
            } else {
                balance = new BigNumber(number).toString();
            }

            return {
                name: typeof name === 'object' ? name._name : name,
                symbol: typeof symbol === 'object' ? symbol._symbol : symbol,
                decimals: typeof decimals === 'object' ? decimals._decimals : decimals,
                balance
            };
        } catch (ex) {
            logger.error(`Failed to fetch token ${ address }:`, ex);
            return false;
        }
    }
};

export default NodeService;

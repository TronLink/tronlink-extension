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
        '109c64ad-e59c-46fe-ba87-179587e6c772': {
            name: 'Mainnet (trongrid)',
            fullNode: 'https://api.trongrid.io',
            solidityNode: 'https://api.trongrid.io',
            eventServer: 'https://api.trongrid.io',
            default: true, // false
            chain: '_',
            connect: '51a36e5a-2480-4b57-989c-539345a13be2',
            chainType: 0,  // 0: Tron, 1: DappChain
            netType: 0,
            connectChain: {
                fullNode: 'https://sun.tronex.io',
                solidityNode: 'https://sun.tronex.io',
                eventServer: 'https://sun.tronex.io',
                mainGateway: CONTRACT_ADDRESS.MAIN,
                sideGateway: CONTRACT_ADDRESS.SIDE,
                chainId: SIDE_CHAIN_ID,
            }
        },
        '8eeb5be6-5e10-4283-ae61-03c0e4726fe0': {
            name: 'Mainnet (tronex)',
            fullNode: 'https://httpapi.tronex.io',
            solidityNode: 'https://httpapi.tronex.io',
            eventServer: 'https://api.trongrid.io',
            default: false, 
            chain: '_',
            connect: '51a36e5a-2480-4b57-989c-539345a13be2',
            chainType: 0,  // 0: Tron, 1: DappChain
            netType: 0,   // 0: mainnet, 1: testnet
            connectChain: {
                fullNode: 'https://sun.tronex.io',
                solidityNode: 'https://sun.tronex.io',
                eventServer: 'https://sun.tronex.io',
                mainGateway: CONTRACT_ADDRESS.MAIN,
                sideGateway: CONTRACT_ADDRESS.SIDE,
                chainId: SIDE_CHAIN_ID,
            }
        },
        'b9424719-b45b-45aa-95d0-1b1b25fc75ae': {
            name: 'Shasta Testnet',
            fullNode: 'https://api.shasta.trongrid.io',
            solidityNode: 'https://api.shasta.trongrid.io',
            eventServer: 'https://api.shasta.trongrid.io',
            default: false,
            chain: '_',
            chainType: 0,
            netType: 1,
            connectChain: false,
        },
        'f14212e2-a6a0-4391-9419-07b55f8be63e': {
            name: 'Tronex Testnet',
            fullNode: 'https://testhttpapi.tronex.io',
            solidityNode: 'https://testhttpapi.tronex.io',
            eventServer: 'https://testapi.tronex.io',
            default: false,
            chain: '_',
            connect: '01eda3a0-5a58-4e44-9f95-f7f1f59dd728',
            chainType: 0,
            netType: 1,
            connectChain: {
                fullNode: 'https://suntest.tronex.io',
                solidityNode: 'https://suntest.tronex.io',
                eventServer: 'https://suntest.tronex.io',
                mainGateway: CONTRACT_ADDRESS.MAIN_TEST,
                sideGateway: CONTRACT_ADDRESS.SIDE_TEST,
                chainId: SIDE_CHAIN_ID_TEST,
            }
        },
        '910d7fa5-da35-419d-b454-fd4ee22087cd': {
            name: 'Nile Testnet',
            fullNode: 'https://api.nileex.io',
            solidityNode: 'https://api.nileex.io',
            eventServer: 'https://event.nileex.io',
            default: false,
            chain: '_',
            chainType: 0,
            netType: 1,
            connectChain: false,
        },
        '51a36e5a-2480-4b57-989c-539345a13be2': {
            name: 'DappChain Mainnet',
            fullNode: 'https://sun.tronex.io',
            solidityNode: 'https://sun.tronex.io',
            eventServer: 'https://sun.tronex.io',
            default: true,
            chain: SIDE_CHAIN_ID,
            connect: '109c64ad-e59c-46fe-ba87-179587e6c772',
            chainType: 1,
            netType: 0,
            mainGateway: CONTRACT_ADDRESS.MAIN,
            sideGateway: CONTRACT_ADDRESS.SIDE,
            sideChainId: SIDE_CHAIN_ID,
            connectChain: {
                fullNode: 'https://api.trongrid.io',
                solidityNode: 'https://api.trongrid.io',
                eventServer: 'https://api.trongrid.io',
            }
        },
        '01eda3a0-5a58-4e44-9f95-f7f1f59dd728': {
            name: 'DappChain Tronex Testnet',
            fullNode: 'https://suntest.tronex.io',
            solidityNode: 'https://suntest.tronex.io',
            eventServer: 'https://suntest.tronex.io',
            default: false,
            chain: SIDE_CHAIN_ID,
            connect: 'f14212e2-a6a0-4391-9419-07b55f8be63e',
            chainType: 1,
            netType: 1,
            mainGateway: CONTRACT_ADDRESS.MAIN_TEST,
            sideGateway: CONTRACT_ADDRESS.SIDE_TEST,
            sideChainId: SIDE_CHAIN_ID_TEST,
            connectChain: {
                fullNode: 'https://testhttpapi.tronex.io',
                solidityNode: 'https://testhttpapi.tronex.io',
                eventServer: 'https://testapi.tronex.io',
            }
        },

    },
    _selectedChain: '_',
    _selectedNode: '109c64ad-e59c-46fe-ba87-179587e6c772',
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
            eventServer,
            chainType,
            connectChain,
            mainGateway,
            sideGateway,
            sideChainId,
        } = this.getCurrentNode();
        if (Number(chainType) === 0) {
            this.tronWeb = new TronWeb(
                fullNode,
                solidityNode,
                eventServer
            );
            if (connectChain) {
               this.sunWeb = new SunWeb(
                new TronWeb(
                    fullNode,
                    solidityNode,
                    eventServer,
               ), new TronWeb(
                   connectChain.fullNode,
                   connectChain.solidityNode,
                   connectChain.eventServer,
               ),
               connectChain.mainGateway,
               connectChain.sideGateway,
               connectChain.chainId);
            } else {
                this.sunWeb.mainchain = new TronWeb(fullNode,
                    solidityNode,
                    eventServer,)
            }
        } else  {
            this.tronWeb = new TronWeb(connectChain.fullNode, connectChain.solidityNode, connectChain.eventServer);
               
            this.sunWeb = new SunWeb(
                new TronWeb(connectChain.fullNode, connectChain.solidityNode, connectChain.eventServer),
                new TronWeb(fullNode, solidityNode, eventServer),
                mainGateway,
                sideGateway,
                sideChainId);
        }
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
        this.sunWeb.mainchain.setAddress(StorageService.selectedAccount);
        this.sunWeb.sidechain.setAddress(StorageService.selectedAccount);
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
            chainType: 0,
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

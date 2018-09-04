import Logger from 'lib/logger';
import Utils from 'lib/utils';
import md5 from 'md5';

import { LOCALSTORAGE_NAMESPACE } from 'lib/constants';

const logger = new Logger('nodes');

const DEFAULT_NODE = '34BD2B5CEBB1FB295117F7CD29056525';

const nodeSelector = {
    init() {
        this._node = DEFAULT_NODE;
        this._storageKey = `${ LOCALSTORAGE_NAMESPACE }_NODES`;

        this._defaultNodes = {
            [DEFAULT_NODE]: {
                name: 'TronWatch Private TestNet',
                full: 'http://rpc.tron.watch:8090',
                solidity: 'http://rpc.tron.watch:8091',
                websocket: 'ws://rpc.tron.watch:8080',
                default: true,
                mainnet: false
            }/*,
            AB015F81F2E4CAA9BB94140D6A72BF56: {
                name: 'Tron TestNet',
                full: 'http://47.254.146.147:8090',
                solidity: 'http://18.185.51.137:8091',
                websocket: false,
                default: false,
                mainnet: false
            }*/
        };

        this._readUserNodes();
    },

    _readUserNodes() {
        logger.info('Reading nodes from local storage');

        this._userNodes = {};
        this._nodes = {};

        const {
            selectedNode,
            nodes
        } = Utils.loadStorage(this._storageKey);

        this._userNodes = nodes || {};

        this._nodes = {
            ...this._defaultNodes,
            ...this._userNodes
        };

        logger.info(`Found ${ Object.keys(this._userNodes).length } user nodes`);

        if(selectedNode)
            this.setNode(selectedNode);
    },

    _saveState() {
        logger.info('Writing node configuration to local storage');

        Utils.saveStorage({
            selectedNode: this._node,
            nodes: this._userNodes
        }, this._storageKey);
    },

    addNode(node) {
        const error = Utils.validateNode(node);

        if(error) {
            logger.warn('Invalid node provided', node);
            logger.error('Node error:', error);

            return { error };
        }

        logger.info('Adding new node', node);

        const {
            full,
            solidity,
            websocket,
            mainnet
        } = node;

        const name = node.name.trim().toLowerCase();
        const nodeHash = md5([ full.toLowerCase(), solidity.toLowerCase(), websocket ? websocket.toLowerCase() : '' ].join('&'));

        if(Object.keys(this._nodes).includes(nodeHash))
            return { error: 'Node already exists' };

        if(Object.values(this._nodes).some(node => node.name.toLowerCase() === name))
            return { error: 'Name already in use' };

        const newNode = {
            default: false,
            name,
            full,
            solidity,
            websocket,
            mainnet
        };

        this._userNodes[nodeHash] = newNode;
        this._nodes[nodeHash] = newNode;

        this._saveState();

        return { nodeHash };
    },

    removeNode(nodeHash) {
        logger.info(`Removing node ${ nodeHash }`);

        // Only remove from _userNodes to prevent removing default node
        delete this._userNodes[nodeHash];

        this._saveState();
        this._readUserNodes();
    },

    setNode(nodeHash) {
        if(!nodeHash || !this._nodes[nodeHash]) {
            logger.warn(`Attempted to set invalid node ${ nodeHash }`);
            return false;
        }

        logger.info(`Setting node to ${ nodeHash }`);

        this._node = nodeHash;
        this._saveState();

        return true;
    },

    get node() {
        if(!this._nodes[this._node])
            this._node = DEFAULT_NODE;

        return {
            ...this._nodes[this._node],
            nodeHash: this._node
        };
    },

    get nodes() {
        return {
            selectedNode: this._node,
            nodes: this._nodes
        };
    }
};

nodeSelector.init();

export default nodeSelector;
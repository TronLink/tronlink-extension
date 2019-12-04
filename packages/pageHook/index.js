import EventChannel from '@tronlink/lib/EventChannel';
import Logger from '@tronlink/lib/logger';
import TronWeb from 'tronweb';
// import NodeService from '@tronlink/backgroundScript/services/NodeService';

import Utils from '@tronlink/lib/utils';
import { CONTRACT_ADDRESS, SIDE_CHAIN_ID, NODE, SIDE_CHAIN_ID_TEST } from '@tronlink/lib/constants';
import RequestHandler from './handlers/RequestHandler';
import ProxiedProvider from './handlers/ProxiedProvider';

import SunWeb from 'sunweb';



const logger = new Logger('pageHook');

const pageHook = {
    proxiedMethods: {
        setAddress: false,
        sign: false,
        setMainGatewayAddress: false,
        setSideGatewayAddress: false,
        multiSign: false,
    },

    init() {
        this._bindTronWeb();
        this._bindEventChannel();
        this._bindEvents();
        this.request('init').then(({ address, node, name, type, phishingList, connectNode = false }) => {
            if (address) {
                this.setAddress({ address, name, type });
            }
            if (node.fullNode) {
                this.setNode({ node: node, connectNode: connectNode});
            }

            logger.info('TronLink initiated');

            if(phishingList) {
                const href = window.location.origin;
                const c = phishingList.filter(({ url }) => {
                    const reg = new RegExp(url);
                    return href.match(reg);
                });
                if (c.length && !c[0].isVisit) {
                    window.location = 'https://www.tronlink.org/phishing.html?href=' + href;
                }
            }
        }).catch(err => {
            logger.error('Failed to initialise TronWeb', err);
        });
    },

    _bindTronWeb() {
        if (window.tronWeb !== undefined) {
            logger.warn('TronWeb is already initiated. TronLink will overwrite the current instance');
        }

        const tronWeb = new TronWeb(
            new ProxiedProvider(),
            new ProxiedProvider(),
            new ProxiedProvider()
        );

        const tronWeb1 = new TronWeb(
            new ProxiedProvider(),
            new ProxiedProvider(),
            new ProxiedProvider()
        );

        const tronWeb2 = new TronWeb(
            new ProxiedProvider(1),
            new ProxiedProvider(1),
            new ProxiedProvider(1)
        );
        const sunWeb = new SunWeb(
            tronWeb1,
            tronWeb2,
            CONTRACT_ADDRESS.MAIN,
            CONTRACT_ADDRESS.SIDE,
            SIDE_CHAIN_ID
        );

        tronWeb.extension = {}; //add a extension object for black list
        tronWeb.extension.setVisited = (href) => {
            this.setVisited(href);
        };
        this.proxiedMethods = {
            setAddress: tronWeb.setAddress.bind(tronWeb),
            setMainAddress: sunWeb.mainchain.setAddress.bind(sunWeb.mainchain),
            setSideAddress: sunWeb.sidechain.setAddress.bind(sunWeb.sidechain),
            sign: tronWeb.trx.sign.bind(tronWeb),
            setMainGatewayAddress: sunWeb.setMainGatewayAddress.bind(sunWeb),
            setSideGatewayAddress: sunWeb.setSideGatewayAddress.bind(sunWeb),
            setChainId: sunWeb.setChainId.bind(sunWeb),
            multiSign: tronWeb.trx.multiSign.bind(tronWeb),
        };

        ['setPrivateKey', 'setAddress', 'setFullNode', 'setSolidityNode', 'setEventServer'].forEach(method => {
            tronWeb[method] = () => new Error('TronLink has disabled this method');
            sunWeb.mainchain[method] = () => new Error('TronLink has disabled this method');
            sunWeb.sidechain[method] = () => new Error('TronLink has disabled this method');
        });

        ['setMainGatewayAddress', 'setSideGatewayAddress', 'setChainId'].forEach(method => {
            sunWeb[method] = () => new Error('TronLink has disabled this method');
        });

        tronWeb.trx.sign = (...args) => (
            this.sign(...args)
        );

        sunWeb.mainchain.trx.sign = (...args) => (
            this.sign(...args)
        );
        sunWeb.sidechain.trx.sign = (...args) => (
            this.sign(...args)
        );

        tronWeb.trx.multiSign = (...args) => (
            this.multiSign(...args)
        );

        sunWeb.mainchain.trx.multiSign = (...args) => (
            this.multiSign(...args)
        );

        sunWeb.sidechain.trx.multiSign = (...args) => (
            this.multiSign(...args)
        );

        window.sunWeb = sunWeb;
        window.tronWeb = tronWeb;
    },

    _bindEventChannel() {
        this.eventChannel = new EventChannel('pageHook');
        this.request = RequestHandler.init(this.eventChannel);
    },

    _bindEvents() {
        this.eventChannel.on('setAccount', address => (
            this.setAddress(address)
        ));

        this.eventChannel.on('setNode', node => (
            this.setNode(node)
        ));
    },

    setAddress({ address, name, type }) {
        // logger.info('TronLink: New address configured');
        if (!tronWeb.isAddress(address)) {
            tronWeb.defaultAddress = {
                hex: false,
                base58: false
            };
            tronWeb.ready = false;
        } else {
            this.proxiedMethods.setAddress(address);
            this.proxiedMethods.setMainAddress(address);
            this.proxiedMethods.setSideAddress(address);
            tronWeb.defaultAddress.name = name;
            tronWeb.defaultAddress.type = type;
            sunWeb.mainchain.defaultAddress.name = name;
            sunWeb.mainchain.defaultAddress.type = type;
            sunWeb.sidechain.defaultAddress.name = name;
            sunWeb.sidechain.defaultAddress.type = type;
            tronWeb.ready = true;
        }

    },

    setSideGatewayInfo(node) {
        if(node.fullNode === 'https://suntest.tronex.io') {
            this.proxiedMethods.setMainGatewayAddress(CONTRACT_ADDRESS.MAIN_TEST);
            this.proxiedMethods.setSideGatewayAddress(CONTRACT_ADDRESS.SIDE_TEST);
            this.proxiedMethods.setChainId(SIDE_CHAIN_ID_TEST);
        } else {
            this.proxiedMethods.setMainGatewayAddress(CONTRACT_ADDRESS.MAIN);
            this.proxiedMethods.setSideGatewayAddress(CONTRACT_ADDRESS.SIDE);
            this.proxiedMethods.setChainId(SIDE_CHAIN_ID);
        }
    },

    setTronWebNode(node, type = false) {
        if (type === 'main') {
            sunWeb.mainchain.fullNode.configure(node.fullNode);
            sunWeb.mainchain.solidityNode.configure(node.solidityNode);
            sunWeb.mainchain.eventServer.configure(node.eventServer);
            this.setSideGatewayInfo(node);
        } else if (type === 'side') {
            sunWeb.sidechain.fullNode.configure(node.fullNode);
            sunWeb.sidechain.solidityNode.configure(node.solidityNode);
            sunWeb.sidechain.eventServer.configure(node.eventServer);
            this.setSideGatewayInfo(node);
        } else {
            tronWeb.fullNode.configure(node.fullNode);
            tronWeb.solidityNode.configure(node.solidityNode);
            tronWeb.eventServer.configure(node.eventServer);
        }
    },

    setNode(node) {

        if (node.node.chain === '_') {
            tronWeb.fullNode.configure(node.node.fullNode);
            tronWeb.solidityNode.configure(node.node.solidityNode);
            tronWeb.eventServer.configure(node.node.eventServer);
            if (node.connectNode) {
                sunWeb.mainchain.fullNode.configure(node.node.fullNode);
                sunWeb.mainchain.solidityNode.configure(node.node.solidityNode);
                sunWeb.mainchain.eventServer.configure(node.node.eventServer);

                sunWeb.sidechain.fullNode.configure(node.connectNode.fullNode);
                sunWeb.sidechain.solidityNode.configure(node.connectNode.solidityNode);
                sunWeb.sidechain.eventServer.configure(node.connectNode.eventServer);
                
                this.setSideGatewayInfo(node.connectNode);
            } else {
                sunWeb.mainchain.fullNode.configure(node.node.fullNode);
                sunWeb.mainchain.solidityNode.configure(node.node.solidityNode);
                sunWeb.mainchain.eventServer.configure(node.node.eventServer);
    
                sunWeb.sidechain.fullNode.configure(NODE.SIDE.fullNode);
                sunWeb.sidechain.solidityNode.configure(NODE.SIDE.solidityNode);
                sunWeb.sidechain.eventServer.configure(NODE.SIDE.eventServer);
                this.setSideGatewayInfo(NODE.SIDE);
            }
        } else  {
            if (node.connectNode) {
                tronWeb.fullNode.configure(node.connectNode.fullNode);
                tronWeb.solidityNode.configure(node.connectNode.solidityNode);
                tronWeb.eventServer.configure(node.connectNode.eventServer);
                
                sunWeb.mainchain.fullNode.configure(node.connectNode.fullNode);
                sunWeb.mainchain.solidityNode.configure(node.connectNode.solidityNode);
                sunWeb.mainchain.eventServer.configure(node.connectNode.eventServer);

                sunWeb.sidechain.fullNode.configure(node.node.fullNode);
                sunWeb.sidechain.solidityNode.configure(node.node.solidityNode);
                sunWeb.sidechain.eventServer.configure(node.node.eventServer);

                this.setSideGatewayInfo(node.node);
            } 
        }
       
    },

    setVisited(href) {
        this.request('setVisited', {
            href
        }).then(res => res).catch(err => {
            logger.error('Failed to set visit:', err);
        });
    },

    sign(transaction, privateKey = false, useTronHeader = true, callback = false) {
        if (Utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = false;
        }

        if (Utils.isFunction(useTronHeader)) {
            callback = useTronHeader;
            useTronHeader = true;
        }

        if (!callback) {
            return Utils.injectPromise(this.sign.bind(this), transaction, privateKey, useTronHeader);
        }

        if (privateKey) {
            return this.proxiedMethods.sign(transaction, privateKey, useTronHeader, callback);
        }

        if (!transaction) {
            return callback('Invalid transaction provided');
        }

        if (!tronWeb.ready) {
            return callback('User has not unlocked wallet');
        }

        this.request('sign', {
            transaction,
            useTronHeader,
            input: (
                typeof transaction === 'string' ?
                    transaction :
                    transaction.__payload__ ||
                    transaction.raw_data.contract[0].parameter.value
            )
        }).then(transaction => (
            callback(null, transaction)
        )).catch(err => {
            logger.error('Failed to sign transaction:', err);
            callback(err);
        });
    },

    multiSign(transaction = false, privateKey = false, permissionId = false, callback = false) {
        if (Utils.isFunction(permissionId)) {
            callback = permissionId;
            permissionId = 0;
        }

        if (Utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = false;
            permissionId = 0;
        }

        if (!callback)
            return Utils.injectPromise(this.multiSign.bind(this), transaction, privateKey, permissionId);

        if (!tronWeb.ready) {
            return callback('User has not unlocked wallet');
        }

        if (!Utils.isObject(transaction) || !transaction.raw_data || !transaction.raw_data.contract)
            return callback('Invalid transaction provided');
            
        if (privateKey) {
            return this.proxiedMethods.multiSign(transaction, privateKey, permissionId, callback);
        }
    
        this.request('sign', {
            transaction,
            useTronHeader: true,
            input: (
                    transaction.__payload__ ||
                    transaction.raw_data.contract[0].parameter.value
            ),
            multiSign: true,
            permissionId,
        }).then(transaction => (
            callback(null, transaction, permissionId)
        )).catch(err => {
            logger.error('Failed to sign transaction:', err);
            callback(err);
        });
       
    }

};

pageHook.init();

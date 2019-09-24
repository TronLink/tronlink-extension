import EventChannel from '@tronlink/lib/EventChannel';
import Logger from '@tronlink/lib/logger';
import TronWeb from 'tronweb';
//import SunWeb from 'sunweb';

import Utils from '@tronlink/lib/utils';
import { CONTRACT_ADDRESS, SIDE_CHAIN_ID, NODE } from '@tronlink/lib/constants'
import RequestHandler from './handlers/RequestHandler';
import ProxiedProvider from './handlers/ProxiedProvider';
import SunWeb from './SunWeb';
// import SunWeb from './SunWeb/js-sdk/src/index';

const logger = new Logger('pageHook');

const pageHook = {
    proxiedMethods: {
        setAddress: false,
        sign: false
    },

    init() {
        this._bindTronWeb();
        this._bindEventChannel();
        this._bindEvents();

        this.request('init').then(({ address, node, name, type, phishingList}) => {
            if(address)
                this.setAddress({address,name,type});

            if(node.fullNode)
                this.setNode(node);

            logger.info('TronLink initiated');
            const href = window.location.origin;
            const c = phishingList.filter(({url})=>{
                const reg = new RegExp(url);
                return href.match(reg);
            });
            if(c.length && !c[0].isVisit){
                window.location = 'https://www.tronlink.org/phishing.html?href='+href;
            }
        }).catch(err => {
            logger.error('Failed to initialise TronWeb', err);
        });
    },

    _bindTronWeb() {
        if(window.tronWeb !== undefined)
            logger.warn('TronWeb is already initiated. TronLink will overwrite the current instance');

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
            new ProxiedProvider(),
            new ProxiedProvider(),
            new ProxiedProvider()
        );
        const sunWeb = new SunWeb(
            tronWeb1,
            tronWeb2,
            //{fullNode:'https://api.trongrid.io',solidityNode:'https://api.trongrid.io',eventServer:'https://api.trongrid.io'},
            //{fullNode:'https://sun.tronex.io',solidityNode:'https://sun.tronex.io',eventServer:'https://sun.tronex.io'},
            //{fullNode:'http://47.252.84.158:8070',solidityNode:'http://47.252.84.158:8071',eventServer:'http://47.252.81.14:8070'},
            //{fullNode:'http://47.252.85.90:8070',solidityNode:'http://47.252.85.90:8071',eventServer:'http://47.252.87.129:8070'},
            CONTRACT_ADDRESS.MAIN,
            CONTRACT_ADDRESS.SIDE,
            SIDE_CHAIN_ID
        );



        tronWeb.extension = {}; //add a extension object for black list
        tronWeb.extension.setVisited=(href)=>{
            this.setVisited(href);
        };
        this.proxiedMethods = {
            setAddress: tronWeb.setAddress.bind(tronWeb),
            setMainAddress: sunWeb.mainchain.setAddress.bind(sunWeb.mainchain),
            setSideAddress: sunWeb.sidechain.setAddress.bind(sunWeb.sidechain),
            sign: tronWeb.trx.sign.bind(tronWeb)
        };

        [ 'setPrivateKey', 'setAddress', 'setFullNode', 'setSolidityNode', 'setEventServer' ].forEach(method => {
            tronWeb[ method ] = () => new Error('TronLink has disabled this method');
            sunWeb.mainchain[ method ] = () => new Error('TronLink has disabled this method');
            sunWeb.sidechain[ method ] = () => new Error('TronLink has disabled this method');
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

    setAddress({address,name,type}) {
        // logger.info('TronLink: New address configured');
        if(!tronWeb.isAddress(address)){
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
            tronWeb.defaultAddress.type =  type;
            sunWeb.mainchain.defaultAddress.name = name;
            sunWeb.mainchain.defaultAddress.type = type;
            sunWeb.sidechain.defaultAddress.name = name;
            sunWeb.sidechain.defaultAddress.type = type;
            tronWeb.ready = true;
        }

    },

    setNode(node) {
        // logger.info('TronLink: New node configured');
        tronWeb.fullNode.configure(node.fullNode);
        tronWeb.solidityNode.configure(node.solidityNode);
        tronWeb.eventServer.configure(node.eventServer);

        sunWeb.mainchain.fullNode.configure(NODE.MAIN.fullNode);
        sunWeb.mainchain.solidityNode.configure(NODE.MAIN.solidityNode);
        sunWeb.mainchain.eventServer.configure(NODE.MAIN.eventServer);

        sunWeb.sidechain.fullNode.configure(NODE.SIDE.fullNode);
        sunWeb.sidechain.solidityNode.configure(NODE.SIDE.solidityNode);
        sunWeb.sidechain.eventServer.configure(NODE.SIDE.eventServer);
    },

    setVisited(href){
        this.request('setVisited', {
            href
        }).then(res => res).catch(err => {
            logger.error('Failed to set visit:', err);
        });
    },

    sign(transaction, privateKey = false, useTronHeader = true, callback = false) {
        if(Utils.isFunction(privateKey)) {
            callback = privateKey;
            privateKey = false;
        }

        if(Utils.isFunction(useTronHeader)) {
            callback = useTronHeader;
            useTronHeader = true;
        }

        if(!callback)
            return Utils.injectPromise(this.sign.bind(this), transaction, privateKey, useTronHeader);

        if(privateKey)
            return this.proxiedMethods.sign(transaction, privateKey, useTronHeader, callback);

        if(!transaction)
            return callback('Invalid transaction provided');

        if(!tronWeb.ready)
            return callback('User has not unlocked wallet');
        this.request('sign', {
            transaction,
            useTronHeader,
            input: (
                typeof transaction === 'string' ?
                    transaction :
                    transaction.__payload__ ||
                    transaction.raw_data.contract[ 0 ].parameter.value
            )
        }).then(transaction => (
            callback(null, transaction)
        )).catch(err => {
            logger.error('Failed to sign transaction:', err);
            callback(err);
        });
    }
};

pageHook.init();

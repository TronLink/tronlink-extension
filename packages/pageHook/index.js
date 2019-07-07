import EventChannel from '@tronlink/lib/EventChannel';
import Logger from '@tronlink/lib/logger';
import TronWeb from 'tronweb';
import Utils from '@tronlink/lib/utils';
import RequestHandler from './handlers/RequestHandler';
import ProxiedProvider from './handlers/ProxiedProvider';


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

        this.request('init').then(({ address, node }) => {
            if(address)
                this.setAddress(address);

            if(node.fullNode)
                this.setNode(node);

            logger.info('TronLink initiated');
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

        this.proxiedMethods = {
            setAddress: tronWeb.setAddress.bind(tronWeb),
            sign: tronWeb.trx.sign.bind(tronWeb)
        };

        [ 'setPrivateKey', 'setAddress', 'setFullNode', 'setSolidityNode', 'setEventServer' ].forEach(method => (
            tronWeb[ method ] = () => new Error('TronLink has disabled this method')
        ));

        tronWeb.trx.sign = (...args) => (
            this.sign(...args)
        );

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

    setAddress({address, name, type}) {
        // logger.info('TronLink: New address configured');
        if(!tronWeb.isAddress(address)){
            tronWeb.defaultAddress = {
                hex: false,
                base58: false
            };
        }else{
            this.proxiedMethods.setAddress(address);
            tronWeb.defaultAddress.name = name;
            tronWeb.defaultAddress.type =  type;
            tronWeb.ready = true;
        }
    },

    setNode(node) {
        // logger.info('TronLink: New node configured');
        tronWeb.fullNode.configure(node.fullNode);
        tronWeb.solidityNode.configure(node.solidityNode);
        tronWeb.eventServer.configure(node.eventServer);
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

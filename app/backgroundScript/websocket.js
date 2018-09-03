import randomUUID from 'uuid/v4';
import Logger from 'lib/logger';
import Utils from 'lib/Utils';

import { LOCALSTORAGE_NAMESPACE } from 'lib/constants';

const logger = new Logger('WebSocket');

export default class TronWebsocket {
    constructor(popup, url = 'rpc.tron.watch:8080') {
        this._popup = popup;
        this._url = url;
        this._storageKey = `${ LOCALSTORAGE_NAMESPACE }_PRICE`;

        this._stopped = false;
        this._webSocket = false;
        this._connectionID = randomUUID();
        this._addresses = [];
        this._price = 0;
        this._lastPriceUpdate = 0;

        this.loadPrice();

        this._popup.on('getPrice', ({ resolve }) => {
            resolve({
                price: this._price,
                lastUpdated: this._lastPriceUpdate
            });
        });

        setInterval(() => {
            if(!this._webSocket || this._webSocket.readyState !== 1)
                return;

            this._webSocket.send(JSON.stringify({
                userid: this._connectionID,
                cmd: 'PING'
            }));
        }, 2500);
    }

    loadPrice() {
        const {
            price,
            lastUpdated
        } = Utils.loadStorage(this._storageKey);

        if(!price)
            return;

        this._price = price;
        this._lastPriceUpdate = lastUpdated;

        this.broadcastPrice();
    }

    broadcastPrice() {
        this._popup.broadcastPrice({
            price: this._price,
            lastUpdated: this._lastPriceUpdate
        });
    }

    savePrice(price, lastUpdated = Date.now()) {
        this._price = price;
        this._lastPriceUpdate = lastUpdated;

        Utils.saveStorage({
            price,
            lastUpdated
        }, this._storageKey);
    }

    onEvent(event) {
        let message;

        try {
            message = JSON.parse(event.data);
        } catch(ex) {
            logger.warn('Failed to parse websocket event');
            return logger.error(ex);
        }

        if(message.cmd === 'ADDRESS_EVENT') {
            if(this.callback)
                this.callback(message.address);

            return logger.info('Address event:', message);
        }

        if(message.symbol === 'TRX' && message.USD && message.USD.price) {
            logger.info(`Received new TRX price: $${message.USD.price}`);

            this.savePrice(
                parseFloat(message.USD.price)
            );

            return this.broadcastPrice();
        }

        logger.warn('Received unknown websocket event', event);
    }

    onConnect() {
        logger.info('Connection established');

        this._addresses.forEach(address => {
            this._addAlert(address);
        });
    }

    _addAlert(address) {
        if(this._addresses.includes(address))
            return logger.warn('Attempted to add duplicate alert for', address);

        this._addresses.push(address);

        this._webSocket.send(JSON.stringify({
            userid: this._connectionID,
            cmd: 'START_ALERT',
            address
        }));
    }

    getPrice() {
        return this._price;
    }

    addAddress(address) {
        logger.info(`Creating bind for address ${address}`);

        if(this._addresses.includes(address))
            return logger.info(`Address ${address} already bound`);

        this._addAlert(address);
    }

    addAddresses(...addresses) {
        addresses.forEach(address => {
            this.addAddress(address);
        });
    }

    start() {
        if(!this._url)
            return logger.warn('Websocket attempted connection without valid URL');

        logger.info('Initiating connection');

        this._webSocket = new WebSocket(this._url);

        this._webSocket.onopen = event => {
            this.onConnect(event);
        };

        this._webSocket.onclose = () => {
            logger.warn('Lost connection to websocket');
        };

        this._webSocket.onmessage = event => {
            this.onEvent(event);
        };

        this._stopped = false;
    }

    stop() {
        if(!this._webSocket)
            return;

        this._stopped = true;
        this._webSocket.close();

        this._webSocket = false;
    }
}
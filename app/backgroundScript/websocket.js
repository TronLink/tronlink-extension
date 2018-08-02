import randomUUID from 'uuid/v4';
import Logger from 'lib/logger';

const logger = new Logger('WebSocket');

export default class TronWebsocket {
    constructor(popup, url = 'ws://rpc.tron.watch:8080') {
        this._popup = popup;
        this._url = url;

        this._webSocket = false;
        this._connectionID = randomUUID();
        this._addresses = [];
        this._price = 0;

        this._popup.on('getPrice', ({ resolve }) => {
            resolve(this._price);
        });
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

            this._price = parseFloat(message.USD.price);
            return this._popup.broadcastPrice(
                this._price
            );
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

    _connect() {
        logger.info('Initiating connection');

        this._webSocket = new WebSocket(this._url);

        this._webSocket.onopen = event => {
            this.onConnect(event);
        };

        this._webSocket.onclose = () => {
            logger.info('Lost connection to websocket');

            setTimeout(() => {
                this._connect();
            }, 5000);
        };

        this._webSocket.onmessage = event => {
            this.onEvent(event);
        };
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
        this._connect();

        setInterval(() => {
            this._webSocket.send(JSON.stringify({
                userid: this._connectionID,
                cmd: 'PING'
            }));
        }, 2500);
    }
}
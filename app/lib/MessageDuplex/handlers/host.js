import EventEmitter from 'eventemitter3';
import randomUUID from 'uuid/v4';
import Logger from 'lib/logger';
import extensionizer from 'extensionizer';

const logger = new Logger('MessageDuplex.Host');

class MessageDuplexHost extends EventEmitter {
    constructor() {
        super();

        this.channels = new Map();
        this.incoming = new Map(); // Incoming message replies
        this.outgoing = new Map(); // Outgoing message replies

        extensionizer.runtime.onConnect.addListener(channel => (
            this.handleNewConnection(channel)
        ));
    }

    handleNewConnection(channel) {
        const {
            name,
            sender: {
                id,
                url
            }
        } = channel;

        logger.info('New connection acquired:', { name, id, url });

        const channelList = (this.channels.get(name) || new Map());

        this.channels.set(name, channelList.set(id, {
            channel,
            url
        }));

        channel.onMessage.addListener(message => (
            this.handleMessage(name, message)
        ));

        channel.onDisconnect.addListener(() => {
            logger.info(`Connection ${ id } disconnected`);
            // delete any pending requests that match this name + id

            const channelList = this.channels.get(name);

            if(!channelList)
                return;

            channelList.delete(id);
        });
    }

    handleMessage(source, message) {
        logger.info(`Received message from ${ source }:`, message);

        const {
            timeout = 30000,
            noAck = false,
            messageID,
            action,
            data
        } = message;

        if(action == 'messageReply')
            return this.handleReply(data);

        if(noAck)
            return this.emit(action, data);

        const messageExpiry = timeout && setTimeout(() => {
            if(!this.incoming.has(messageID))
                return;

            this.incoming.delete(messageID);
        }, timeout);

        this.incoming.set(messageID, res => (
            this.send(source, 'messageReply', { messageID, ...res }, false)
        ));

        this.emit(action, {
            resolve: res => {
                if(!this.incoming.get(messageID))
                    return logger.warn(`Message ${ messageID } expired`);

                this.incoming.get(messageID)({ error: false, res });
                this.incoming.delete(messageID);
                clearTimeout(messageExpiry);
            },
            reject: res => {
                if(!this.incoming.get(messageID))
                    return logger.warn(`Message ${ messageID } expired`);

                this.incoming.get(messageID)({ error: true, res });
                this.incoming.delete(messageID);
                clearTimeout(messageExpiry);
            },
            data
        });
    }

    handleReply({ messageID, error, res }) {
        if(!this.outgoing.has(messageID))
            return;

        if(error)
            this.outgoing.get(messageID)(Promise.reject(res));
        else this.outgoing.get(messageID)(res);

        this.outgoing.delete(messageID);
    }

    broadcast(action, data, requiresAck = true, timeout = 30000) {
        return Promise.all([ ...this.channels.keys() ].map(channelGroup => (
            this.send(channelGroup, action, data, requiresAck, timeout)
        )));
    }

    send(source = false, action, data, requiresAck = true, timeout = 30000) {
        if(!this.channels.has(source))
            return Promise.reject('Target channel does not exist');

        if(!requiresAck) {
            return this.channels.get(source).forEach(({ channel }) => (
                channel.postMessage({ action, data, noAck: true })
            ));
        }

        return new Promise((resolve, reject) => {
            const messageID = randomUUID();

            this.outgoing.set(messageID, resolve);

            if(timeout) {
                setTimeout(() => {
                    if(!this.outgoing.has(messageID))
                        return;

                    this.outgoing.delete(messageID);
                    reject('Function call timed out');
                }, timeout);
            }

            this.channels.get(source).forEach(({ channel }) => (
                channel.postMessage({ action, data, messageID, timeout, noAck: false })
            ));
        });
    }
}

export default MessageDuplexHost;
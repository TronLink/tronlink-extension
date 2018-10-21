import EventEmitter from 'eventemitter3';
import randomUUID from 'uuid/v4';
import Logger from 'lib/logger';
import extensionizer from 'extensionizer';

const logger = new Logger('MessageDuplex.Child');

class MessageDuplexChild extends EventEmitter {
    constructor(type = false, name = false) {
        super();

        if(![ 'tab', 'popup' ].includes(type))
            throw new Error(`MessageDuplexChild expects a source type of either tab or popup, instead "${ type }" was provided`);

        if(!name)
            throw new Error('MessageDuplexChild expects a process name');

        this.name = name;
        this.incoming = new Map(); // Incoming message replies
        this.outgoing = new Map(); // Outgoing message replies
        this.messageListener = false;
        this.disconnectListener = false;

        this.resetGovernor();
        this.connectToHost();
        this.connectionGovernor();
    }

    connectToHost() {
        this.channel = extensionizer.runtime.connect(EXTENSION_ID, {
            name: this.name
        });

        this.governor.isConnected = true;

        this.messageListener = this.channel.onMessage.addListener(message => {
            this.handleMessage(message);
        });

        this.disconnectListener = this.channel.onDisconnect.addListener(() => {
            const error = (this.channel.error || extensionizer.runtime.lastError).message;

            logger.error('Lost connection to MessageDuplexHost:', error);

            this.governor.isConnected = false;
            this.governor.reconnect();
        });
    }

    resetGovernor() {
        if(this.governor && this.governor.connectionEstablisher.func)
            clearInterval(this.connectionGovernor.connectionEstablisher.func);

        this.governor = {
            isConnected: false,
            hasTimedOut: false, // after connectionEstablisher.remaining = 0
            connectionEstablisher: {
                func: false,
                remaining: 5 // try 5 times, 1 second span
            },
            queue: [],
            reconnect: () => {
                logger.warn('MessageDuplexChild requested reconnect');
            }
        };

        // on disconnect call:
        // - this.channel.onDisconnect.removeListener(this.disconnectListener);
        // - this.channel.onMessage.removeListener(this.messageListener);
    }

    connectionGovernor() {
        if(this.isHost)
            throw new Error('Host port cannot establish governor status');

        // Check if extension is established here
        // Add error/disconnect listener here

        // if !this.governor.isConnected, immedietly invoke reconnection timeout

        // This function will check for disconnects, and attempt to re-establish
        // communication. It will also queue any messages during disconnection
        // for a maximum of 5 seconds before returning an error status on all messages.
    }

    handleMessage({ action, data, messageID, timeout = 30000, noAck = false }) {
        logger.info('Received new message', { action, data, messageID });

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
            this.send('messageReply', { messageID, ...res }, false)
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

    send(action, data, requiresAck = true, timeout = 30000) {
        const { governor } = this;

        if(!governor.isConnected && !governor.hasTimedOut) {
            return new Promise((resolve, reject) => governor.queue.push({
                action,
                data,
                resolve,
                reject
            }));
        }

        if(!governor.isConnected && governor.hasTimedOut)
            return Promise.reject('Failed to establish connection to extension');

        if(!requiresAck)
            return this.channel.postMessage({ action, data, noAck: true });

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

            this.channel.postMessage({ action, data, messageID, timeout, noAck: false });
        });
    }
}

export default MessageDuplexChild;
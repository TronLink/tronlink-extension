import Communication, { CommunicationChannel } from 'lib/communication/index.js';

console.log('Page hook loaded');

/*const eventCommunication = new Communication(CommunicationChannel.EVENT_LISTENER, 'tronPageHook');

eventCommunication.on('test', data => {
    console.log('received event with data', data);
});

eventCommunication.send('test', { from: 'pageHook' }, 'tronContentScript');*/
import Communication, { CommunicationChannel } from 'lib/communication/index.js';

console.log('Background script loaded');

/*const portCommunication = new Communication(CommunicationChannel.PORT, 'tronBackgroundScript');

portCommunication.on('test', data => {
    console.log('received port with data', data);

    portCommunication.send('test', { from: 'backgroundScript 1' });
    portCommunication.send('test', { from: 'backgroundScript 2' });

    setTimeout(() => {
        portCommunication.send('test', { from: 'backgroundScript 3' });
    }, 3000);
});*/
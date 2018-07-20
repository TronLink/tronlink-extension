import PortHost from 'lib/communication/PortHost';

import tron from 'TronUtils';

console.log(tron.accounts.generateRandomBip39());

console.log('Background script loaded');


const contentChannel = new PortHost();

contentChannel.on('test', ({ tabID, data }) => {
    console.log('received event with data', data, 'from', tabID);

    contentChannel.send(tabID, 'test', { from: 'backgroundScript' });
});



/*const portCommunication = new Communication(CommunicationChannel.PORT, 'tronBackgroundScript');

portCommunication.on('test', data => {
    console.log('received port with data', data);

    portCommunication.send('test', { from: 'backgroundScript 1' });
    portCommunication.send('test', { from: 'backgroundScript 2' });

    setTimeout(() => {
        portCommunication.send('test', { from: 'backgroundScript 3' });
    }, 3000);
});*/
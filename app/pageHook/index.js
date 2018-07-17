import EventDispatcher from 'lib/communication/EventDispatcher.js';

console.log('Page hook loaded');

const communicationChannel = new EventDispatcher('tronPageHook');

communicationChannel.on('test', data => {
    console.log('received event with data', data);
});

communicationChannel.send('tronContentScript', 'test', { from: 'pageHook' });
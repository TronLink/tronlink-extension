import EventDispatcher from 'lib/communication/EventDispatcher.js';

console.log('Page hook loaded');

const contentScript = new EventDispatcher('pageHook', 'contentScript');

contentScript.on('test', ({ data, source }) => {
    console.log(`pageHook received ${JSON.stringify(data)} from ${source}`);
});

contentScript.send('test', { time: Date.now() });
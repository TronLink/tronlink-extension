import EventDispatcher from 'lib/communication/EventDispatcher.js';
import LinkedRequest from 'lib/utils/LinkedRequest';

console.log('Page hook loaded');

const contentScript = new EventDispatcher('pageHook', 'contentScript');
const linkedRequest = new LinkedRequest(({ source, data }) => ({ ...data }));

contentScript.on('tunnel', data => {
    console.log(`Received ${JSON.stringify(data)} tunneled from backgroundScript`);

    const responseSent = linkedRequest.dataStream(data);

    if(!responseSent)
        return console.log(`Promise timed out for linked request ${data.uuid}`);

    console.log(`Resolved promise for linked request ${data.uuid}`);
});

const beginTest = () => {
    const { request, promise } = linkedRequest.create({ hello: 'world' }, 5);

    promise.then(({ success, error = false, data = {} }) => {
        console.log({ success, error, data });
    });

    contentScript.send('tunnel', request);
}

beginTest();

// contentScript.on('test', ({ data, source }) => {
//     console.log(`pageHook received ${JSON.stringify(data)} from ${source}`);
// });
// 
// contentScript.send('test', { time: Date.now() });
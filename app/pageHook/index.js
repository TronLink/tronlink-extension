import EventDispatcher from 'lib/communication/EventDispatcher.js';
import LinkedRequest from 'lib/messages/LinkedRequest';

console.log('Page hook loaded');

const contentScript = new EventDispatcher('pageHook', 'contentScript');
const linkedRequest = new LinkedRequest(contentScript, ({ source, data }) => ({ ...data }));

const beginTest = () => {
    const result = linkedRequest.build({ hello: 'world' }, 5);

    result.then(response => {
        console.log({ response });
    }).catch(error => {
        console.warn({ error });
    });
}

beginTest();
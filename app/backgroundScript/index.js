import PortHost from 'lib/communication/PortHost';
import LinkedResponse from 'lib/messages/LinkedResponse';

console.log('Background script loaded');

const contentScript = new PortHost();
const linkedResponse = new LinkedResponse(contentScript);

linkedResponse.on('request', ({ request, resolve, reject }) => {
    resolve(
        JSON.stringify(request)
            .split('')
            .reverse()
            .join('')
    );
});
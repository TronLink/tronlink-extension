import PortHost from 'lib/communication/PortHost';
import LinkedResponse from 'lib/messages/LinkedResponse';

console.log('Background script loaded');

const contentScript = new PortHost();
const linkedResponse = new LinkedResponse(contentScript);

const handleWebCall = ({ request: { method, args = {} }, resolve, reject }) => {
    switch(method) {
        case 'signTransaction':
            const { 
                transaction,
                broadcast
            } = args;
            
            resolve({
                signedTransaction: btoa(String(transaction)),
                broadcasted: false,
                transaction: false
            });
        break;
        case 'getTransaction':
            reject('Method pending implementation');
        break;
        case 'getUserAccount':
            reject('Method pending implementation');
        break;
        case 'simulateSmartContract':
            reject('Method pending implementation');
        default:
            reject('Unknown method called');
    }
}

linkedResponse.on('request', ({ request, resolve, reject }) => {
    if(request.method)
        return handleWebCall({ request, resolve, reject });

    // other functionality here or w/e
});
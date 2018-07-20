import PortHost from 'lib/communication/PortHost';
import LinkedResponse from 'lib/messages/LinkedResponse';

console.log('Background script loaded');

const contentScript = new PortHost();
const linkedResponse = new LinkedResponse(contentScript);

const handleWebCall = ({ request: { method, args = {} }, resolve, reject }) => {
    switch(method) {
        case 'signTransaction':
            // Expects { signedTransaction: string, broadcasted: bool, transactionID: string }

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
            // Expects { transaction: obj }
            reject('Method pending implementation');
        break;
        case 'getUserAccount':
            // Expects { address: string, balance: integer }
            reject('Method pending implementation');
        break;
        case 'simulateSmartContract':
            // I'm not sure what the input / output will be here
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
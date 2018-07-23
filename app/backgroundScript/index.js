import PortHost from 'lib/communication/PortHost';
import PopupClient from 'lib/communication/popup/PopupClient';
import LinkedResponse from 'lib/messages/LinkedResponse';
import Wallet from './wallet';

console.log('Background script loaded');

const portHost = new PortHost();
const popup = new PopupClient(portHost);
const linkedResponse = new LinkedResponse(portHost);
const wallet = new Wallet();

popup.on('requestUnfreeze', ({ data, resolve, reject }) => {
    const { account } = data;

    console.log(`Requested unfreeze for account ${account}`);
    resolve(50); // we unfroze 50 tokens    

    popup.requestVote('your mother').then(({ amount, account }) => {
        console.log(`Vote confirmation for your mother: ${amount} tron power from ${account}`);
    }).catch(err => {
        console.log('Vote confirmation rejected:', err);
    });
});

popup.on('setPassword', ({data, resolve, reject})=>{
    console.log("before, wallet:");
    console.log(wallet);
    if(wallet.isInitialized()){
        alert("Wallet already initialized. Need to explicitly clear before doing this.");
    }else{
        wallet.initWallet(data.password);
    }
});

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

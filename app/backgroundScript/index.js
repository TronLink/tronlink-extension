import PortHost from 'lib/communication/PortHost';
import PopupClient from 'lib/communication/popup/PopupClient';
import LinkedResponse from 'lib/messages/LinkedResponse';
import Wallet from './wallet';
import Logger from 'lib/logger';
import TronUtils from 'TronUtils';
import {CONFIRMATION_TYPE} from "../lib/consts";

const rpc = new TronUtils.rpc();

const logger = new Logger('backgroundScript');
import tron from 'TronUtils';
const portHost = new PortHost();
const popup = new PopupClient(portHost);
const linkedResponse = new LinkedResponse(portHost);
const wallet = new Wallet();

const pendingConfirmations = {};

logger.info('Script loaded');

let currentConfirmationId = 0;
let popup2 = null;

function addConfirmation(confirmation, resolve, reject){

    logger.info('Adding confirmation: ');
    logger.info(confirmation);

    currentConfirmationId++;
    confirmation.id = currentConfirmationId;
    pendingConfirmations[confirmation.id] = {
        confirmation,
        resolve,
        reject
    };

    popup.sendNewConfirmation(confirmation);
    if(popup2){
        popup2.focus();
    }else{
        popup2 = window.open("app/popup/build/index.html", "extension_popup", "width=420,height=595,status=no,scrollbars=yes,resizable=false");
    }
}

function getConfirmations(){
    let out = [];
    let keys = Object.keys(pendingConfirmations);
    for(let i in keys){
        out.push(pendingConfirmations[keys[i]].confirmation);
    }
    logger.info("getConfirmations returning:");
    logger.info(out);

    return out;
}
//open popup

function closePopup2IfQueueEmpty(){
    if(Object.keys(pendingConfirmations) <= 0 && popup2){
        popup2.close();
        popup2 = null;
    }
}

popup.on('declineConfirmation', ({data, resolve, reject})=>{
    if(!pendingConfirmations[data.id])
        alert("tried denying confirmation, but confirmation went missing.");
    pendingConfirmations[data.id].resolve("denied");
    delete pendingConfirmations[data.id];
    resolve();
    closePopup2IfQueueEmpty();
});

popup.on('acceptConfirmation', ({data, resolve, reject})=>{
    if(!pendingConfirmations[data.id])
        alert("tried accepting confirmation, but confirmation went missing.");

    let confirmation = pendingConfirmations[data.id];

    logger.info('accepting confirmation');
    logger.info(confirmation);
    confirmation.resolve("accepted " + JSON.stringify(confirmation.confirmation));

    delete pendingConfirmations[data.id];
    resolve();
    closePopup2IfQueueEmpty();
});

popup.on('getConfirmations', ({data, resolve, reject})=>{
    logger.info('getConfirmations called');
    resolve(getConfirmations());
});

popup.on('setPassword', ({data, resolve, reject})=>{
    logger.info('before, wallet:');
    logger.info(wallet);
    if(wallet.isInitialized()){
        alert("Wallet already initialized. Need to explicitly clear before doing this.");
    }else{
        wallet.initWallet(data.password);
    }
});

async function updateAccount(){
    await wallet.updateAccounts();

    let account = wallet.getAccount();
    popup.sendAccount(account);
}

popup.on('unlockWallet', ({data, resolve, reject})=>{
    logger.info('unlockWallet');
    logger.info(data);
    resolve(wallet.unlockWallet(data.password));
    updateAccount();
});

popup.on('getWalletStatus', ({data, resolve, reject})=>{
    resolve(wallet.getStatus());
});

const handleWebCall = ({ request: { method, args = {} }, resolve, reject }) => {
    switch(method) {
        case 'sendTron':
            addConfirmation({
                type : CONFIRMATION_TYPE.SEND,
                from : args.from,
                amount : args.amount
            }, resolve, reject);
        break;
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
        break;
        default:
            reject('Unknown method called (' + method + ')');
    }
};

linkedResponse.on('request', ({ request, resolve, reject }) => {
    if(request.method)
        return handleWebCall({ request, resolve, reject });

    // other functionality here or w/e
});

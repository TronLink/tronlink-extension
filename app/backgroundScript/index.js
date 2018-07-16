let port = false;

const messageListener = message => {
    port.postMessage('Returning message ' + message);
}

chrome.runtime.onConnect.addListener(messagePort => {
    port = messagePort;
    port.postMessage('Connection established');
    port.onMessage.addListener(messageListener);
});
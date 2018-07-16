console.log('Loaded background script');

chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    if(req.message == 'ping')
        sendRes({ message: 'pong' })
});
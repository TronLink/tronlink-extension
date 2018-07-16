console.log('Loaded page hook');

window.addEventListener('tronPageHook', ({ detail: message }) => {
    console.log('pageHook received message', message);
});

// detail is a required key, it is the payload you want to send with the event
window.dispatchEvent(new CustomEvent('tronContentScript', { detail: 'test message' }));
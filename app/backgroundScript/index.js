import PortHost from 'lib/communication/PortHost';

console.log('Background script loaded');

const contentScript = new PortHost();

// contentScript.on('test', ({ source, data }) => {
//     console.log(`backgroundScript received ${JSON.stringify(data)} from ${source}`);
// 
//     contentScript.send(source, 'test', { time: Date.now() });
// });

// Sends reverse of current input for now
contentScript.on('tunnel', ({ source, data: { uuid, data } }) => {
    console.log(`backgroundScript received ${JSON.stringify(data)} tunneled from ${source}`);

    contentScript.send(source, 'tunnel', {
        uuid,
        data: JSON.stringify(data).split('').reverse().join('')
    });
});
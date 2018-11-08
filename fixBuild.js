/* eslint-disable */

const fs = require('fs');
const path = require('path');

const files = [ 'backgroundScript', 'contentScript', 'pageHook' ];

files.forEach(fileName => {
    const fileLocation = path.join(__dirname, 'dist', `${ fileName }.js`);
    const build = fs.readFileSync(fileLocation, 'utf8');
    const fixed = build
        .replace('if (isInBrowser())', 'if(1 == 2)')
        .replace('retrieveFile(source)', '\'\'');

    fs.writeFileSync(fileLocation, fixed);
});
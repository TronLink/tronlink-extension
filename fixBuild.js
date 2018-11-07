const fs = require('fs');
const path = require('path');

const fileLocation = path.join(__dirname, 'dist', 'pageHook.js');
const build = fs.readFileSync(fileLocation, 'utf8');
const fixed = build
    .replace('if (isInBrowser())', 'if(1 == 2)')
    .replace('retrieveFile(source)', '\'\'');

fs.writeFileSync(fileLocation, fixed);
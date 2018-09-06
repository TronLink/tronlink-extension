const { exec } = require('child_process');

function installPackages() {
    exec('yarn install', (err, stdOut, stdErr) => {
        if(err)
            return;

        if(stdOut && stdOut.includes('Already up-to-date'))
            return console.log('No new package changes');

        console.log('Updated packages');
    });
}

exec('git diff-tree -r --name-only ORIG_HEAD HEAD', (err, stdOut, stdErr) => {
    if(err)
        throw new Error('Failed to fetch git differences', err);

    if(stdErr)
        throw new Error('Error occurred when reading git differences', stdErr);

    if(stdOut.trim().length)
        installPackages();
});
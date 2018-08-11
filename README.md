[![Waffle.io - Columns and their card count](https://badge.waffle.io/f6d99e308cadb82b294cee8c660eaf818ecef3ffaef2fbac9bd5712d22156cdc.svg?columns=all)](https://waffle.io/TronWatch/TronLink)

# TronLink
TronLink is a Chrome Extension for Website to Blockchain intercommunication on the Tron Network.  
It allows developers to integrate smart contract calls on their site, in turn enabling the use of Dapps from within the browser. It also functions as a standard Tron wallet for anybody wanting to broadcast and receive transactions on the network.

**As of current, TronLink is only intended for developers looking to integrate Dapps on their websites.** Due to limitations of the current Tron network, TronLink can only function on _TronWatch's_ private network. Once the majority of nodes on the official Tron testnet have updated to include TVM support the network connection will be migrated.

TronLink will soon support network selection on a global or per-website basis. We intend for this feature to be used so that developers can utilise the extension on production sites but still retain the ability to test their own integrations in development or staging environments. Until Tron have exposed smart contract calls via the Node HTTP API, TronLink will be limited to constructing smart contract transactions through TronWatch's API.

Documentation regarding communicating with the blockchain will be published soon. For now we suggest you [**take a look at the example site**](https://tronwatch.github.io/TronLink-Examples/). 

If you would like to follow the development progress of the extension we invite you to view our [**task board on waffle.io**](https://waffle.io/TronWatch/TronLink).

TronLink will be published on the Chrome Web Store once we believe the extension is mature enough to be used by the public on the official Tron testnet.

Build Instructions (Unix):
```
git clone https://github.com/TronWatch/TronLink/
yarn install
yarn symlink
yarn build:all
```

Build Instructions (Windows):
```
git clone https://github.com/TronWatch/TronLink/
yarn install
yarn symlink:win
yarn build:all
```

Load the root folder as an unpacked Chrome Extension in Chrome.

The symlink is required due to sharing a small communication and utility library between the backend and the popup (react).

If you would only like to build the backend of the extension run `yarn build`. If you would like to build just the popup (react) run `yarn build:react`. If you wish to build both at the same time run `yarn build:all`.

Linting is automated and is required to submit changes to the project. ESLint will automatically run when you create a commit and also during a PR. You can find the ESLint configuration in the root directory at `.eslintrc.js`. At the moment there is no linting enforced for the popup (`app/popup/src`).

When building for react a production output will be created due to limitations by `create-react-app`. It will include the source map for debugging.

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _index = __webpack_require__(2);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = chrome.runtime.connect({ name: 'tronContentScript' });

port.onMessage.addListener(function (message) {
    console.log('contentScript received message', message);
});

console.log('contentScript sending message ping');
port.postMessage('ping');

// Listen to messages from pageHook.js
window.addEventListener('tronContentScript', function (_ref) {
    var message = _ref.detail;

    // We should add a target param to the message
    // so we know when to forward to backgroundScript.js

    // forward with port.postMessage('ping')
    // reply with window.dispatchEvent (we should make 
    // this a wrapper that calls back with a reply method)

    console.log('contentScript receive message (from pageHook):', message);
    window.dispatchEvent(new CustomEvent('tronPageHook', { detail: 'Returning message ' + message }));
});

// Inject pageHook.js into page
document.addEventListener('DOMContentLoaded', function (event) {
    console.log('DOM loaded, injecting pageHook.js');

    var node = document.getElementsByTagName('body')[0];
    var script = document.createElement('script');

    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.extension.getURL('dist/pageHook.js'));

    node.appendChild(script);
});

// To wait for dom element to be created:
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CommunicationChannel = exports.CommunicationChannel = {
    PORT: Symbol('PORT'),
    EVENT_LISTENER: Symbol('EVENT_LISTENER')
};

var Communication = function () {
    function Communication() {
        var communicationChannel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var channelKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, Communication);

        if (!communicationChannel) throw 'No communication channel provided';

        if (!Object.values(CommunicationChannel).includes(communicationChannel)) throw 'Invalid communication channel provided';

        this._channel = communicationChannel;
        this._channelKey = channelKey;

        this._registerListeners();
    }

    _createClass(Communication, [{
        key: '_registerListeners',
        value: function _registerListeners() {
            if (this._channel == CommunicationChannel.PORT) this._registerPortListeners();

            if (this._channel == CommunicationChannel.EVENT_LISTENER) this._registerEventListeners();
        }
    }, {
        key: '_registerEventListeners',
        value: function _registerEventListeners() {
            window.addEventListener(this._channelKey, function (_ref) {
                var event = _ref.detail;

                // this.emit(event.action, event.data);

                // We should add a target param to the message
                // so we know when to forward to backgroundScript.js

                // forward with port.postMessage('ping')
                // reply with window.dispatchEvent (we should make 
                // this a wrapper that calls back with a reply method)

                console.log('contentScript receive message (from pageHook):', message);
                window.dispatchEvent(new CustomEvent('tronPageHook', { detail: 'Returning message ' + message }));
            });
        }
    }, {
        key: '_sentEventListener',
        value: function _sentEventListener(channel, action, data) {
            window.dispatchEvent(new CustomEvent(channel, {
                detail: {
                    action: action,
                    data: data
                }
            }));
        }
    }, {
        key: 'send',
        value: function send(action) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var channel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            if (this._channel == CommunicationChannel.PORT) this._sendPort(action, data);

            if (this._channel == CommunicationChannel.EVENT_LISTENER) this._sendEventListener(channel, action, data);
        }
    }]);

    return Communication;
}();

exports.default = Communication;

/***/ })
/******/ ]);
//# sourceMappingURL=contentScript.js.map
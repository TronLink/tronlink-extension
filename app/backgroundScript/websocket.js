import {CURRENCY} from '../lib/constants';

export default class TronWebsocket{

    constructor(popup, url = "ws://ws.tron.watch:8089"){
        this.popup = popup;
        this.url = url;
        this.state = {
            userid : this.guid()
        };
        this.accounts = [];
    }

    websocketOnMessage(event) {
        try {
            let msg = JSON.parse(event.data);
            if (msg.cmd === "ADDRESS_EVENT") {
                //UPDATE AN ACCOUNT...
                //this.props.startUpdating(this.props.wallet.persistent, msg.address);
            } else if (msg.symbol === "TRX" && msg["USD"].price) {
                this.popup.broadcastPrice(parseFloat(msg['USD'].price));
                //this.props.setFiatPrice(CURRENCY.USD, msg["USD"].price);
            } else {
            }
        } catch (e) {}
    }


    websocketOnOpen(event) {
        this.state.requested = {};
        let keys = Object.keys(this.accounts);
        this.addAddresses(keys);
    }

    checkWebsocket() {
        if (
            this.state.websocket !== null &&
            this.state.websocket.readyState === WebSocket.OPEN
        ) {
            //do nothing, we're connected
        } else if (
            this.state.websocket &&
            this.state.websocket.readyState === WebSocket.CLOSED
        ) {
            this.connectWebsocket();
        }
        setTimeout(this.checkWebsocket.bind(this), 5000);
    }

    addWebsocketAlert(address) {
        if (this.state.websocket.readyState === WebSocket.OPEN) {
            this.state.websocket.send(
                JSON.stringify({
                    cmd: "START_ALERT",
                    address: address,
                    userid: this.state.userid
                })
            );
            this.state.requested[address] = 1;
        }
    }

    connectWebsocket() {
        console.log("connecting websocket");
        this.state.websocket = new WebSocket(this.url);
        this.state.websocket.onopen = this.websocketOnOpen.bind(this);
        this.state.websocket.onmessage = this.websocketOnMessage.bind(this);
    }

    start() {
        this.connectWebsocket();
        setTimeout(this.checkWebsocket.bind(this), 0);
    }

    addAddresses(list) {
        for (let i = 0; i < list.length; i++) {
            let addr = list[i];
            if (!this.state.requested[addr]) {
                this.addWebsocketAlert(addr);
            }
        }
    }

    guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return (
            s4() +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            s4() +
            s4()
        );
    }
}
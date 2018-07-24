import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import './Queue.css';

import { store } from '../../index.js';


class Queue extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }
    /*
    <input 
        placeholder="Enter Private Key to Import a Wallet..."
        className="textInput"
        type="text"
        value={this.state.privateKey}
        onChange={this.handlePrivateKeyChange}
    />
    */

    /*
    {
        type : 'send',
        amount : '123127387192'
        to : '123123578192376123901'
    }
    */

    rejectSend() {
        console.log('Rejected.')
        // store.dispatch();
    }

    confirmSend() {
        console.log('Confirmed.')
        // store.dispatch();
    }


    render() {
        // return most recent confirmation from queue
        const confirmation = this.props.confirmations[0];

        return (
            <div className="confirmSend">
                <div className="confirmGroup">
                    <div className="confirmGroupTop">
                        <div className="confirmGroupHeader bold">Total</div>
                        <div className="confirmGroupAmount bold orange">{ confirmation.amount } TRX</div>
                    </div>
                    <div className="confirmGroupBottom">11.28 <span>USD</span></div>
                </div>
                <div className="confirmGroupDetail">Data Included: 36 bytes</div>
                <div className="confirmGroup confirmButtonContainer">
                    <div className="confirmButton button outline" onClick={this.rejectSend()}>Reject</div>
                    <div className="confirmButton button gradient" onClick={this.confirmSend()}>Confirm</div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    confirmations: state.confirmations.confirmations,
    accounts: state.wallets
}))(Queue);
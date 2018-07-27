import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import './Queue.css';

import { store, popup} from '../../index.js';
import {updateConfirmations} from "../../reducers/confirmations";

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

    async rejectSend() {
        console.log('Rejected.');
        await popup.declineConfirmation(this.props.confirmations[0].id);
        return updateConfirmations();
    }

    async confirmSend() {
        console.log('Confirmed.');
        await popup.acceptConfirmation(this.props.confirmations[0].id);
        return updateConfirmations();
    }

    render() {
        // return most recent confirmation from queue
        //const confirmation = this.props.confirmations[0];
        const confirmation = {
            id: 1,
            type: 'send',
            amount: '50000',
            to: 'TNGHIgeegdGBS475896394',
            from: 'TJEIBNVuoheOHGOEh38yGHOUEOD',
            domain: 'google.com',
            note: 'Hello world from google.com. This is a test note that is very long at max 250char. This is actually the maximum length, so this is why im testing this massive note cause i think it may be too big so we will see. we are almost full uh oh, got only a s'
        }

        return (
            <div className="confirmSend">
                <div className=""></div>
                
                <div className="confirmSubContainer">
                    <div className="noteTitle">Note from: { confirmation.domain }</div>
                    <div className="noteBody">{ confirmation.note }</div>
                </div>

                <div className="confirmGroup">
                    <div className="confirmGroupTop">
                        <div className="confirmGroupHeader bold">Total</div>
                        <div className="confirmGroupAmount bold orange">{ confirmation.amount } TRX</div>
                    </div>
                    <div className="confirmGroupBottom">11.28 <span>USD</span></div>
                </div>
                <div className="confirmWarningHeader">⚠ WARNING! </div>
                <div className="confirmWarningBody">Only send funds to services and people that you trust. TronLink is not responsible for your own mis-spending. Never send funds to websites that will promise you free returns.</div>
                <div className="confirmGroup confirmButtonContainer">
                    <div className="confirmButton button outline" onClick={this.rejectSend.bind(this)}>Reject</div>
                    <div className="confirmButton button gradient" onClick={this.confirmSend.bind(this)}>Confirm</div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    confirmations: state.confirmations.confirmations,
    accounts: state.wallets
}))(Queue);
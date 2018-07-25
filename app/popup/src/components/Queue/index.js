import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import './Queue.css';

import {CONFIRMATION_TYPE} from "../../extension/consts";
import { store } from '../../index.js';

import Send from './send.js';


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



    renderConfirmationType() {
        // return most recent confirmation from queue to check type
        const confirmation = this.props.confirmations[0];

        if (confirmation.type === CONFIRMATION_TYPE.SEND) return <Send />;
    }

    render() {
        return (
            <div>
                { this.renderConfirmationType() }
            </div>
        );
    }
}

export default connect(state => ({
    confirmations: state.confirmations.confirmations,
    accounts: state.wallet.accounts
}))(Queue);
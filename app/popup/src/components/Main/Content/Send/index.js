import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import './Send.css';

import { store } from '../../../../index.js';


class Send extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: 'TRX',
            amount: '',
            label: 'TRX'
        };
    }
    

    handleRadioToggle = (e) => this.setState({ mode: e.target.value });

    handleAmount = (e) => this.setState({ amount: e.target.value });

    loadTokens() {
        let arr = [];
        let tokens = Object.keys(this.props.account.tokens);

        tokens.forEach((token, i) => {
            let curToken = this.props.account.tokens[token];
            if (curToken.tokenAbbr) {
                arr.push({ label: curToken.tokenAbbr, id: token });
            } else {
                arr.push({ label: curToken.tokenName, id: token });
            }
        })
    }

    renderLabel() {
        if (this.state.mode === 'TOKEN') {
            return;
        }
        return <div className="sendLabel">TRX</div>;
    }

    cancelTransaction() {
        console.log('Canceled.')
        // store.dispatch();
    }

    sendTransaction() {
        console.log('Confirmed.')
        // store.dispatch();
    }


    render() {
        return (
            <div className="send">
                <div className="sendRadioGroup">
                    <div className="sendRadioButton">
                        <input 
                            type="radio"
                            value={'TRX'}
                            onChange={this.handleRadioToggle}
                            checked={this.state.mode === 'TRX'}
                        /><span>TRX</span>
                    </div>
                    <div className="sendRadioButton">
                        <input 
                            type="radio"
                            value={'TOKEN'}
                            onChange={this.handleRadioToggle}
                            checked={this.state.mode === 'TOKEN'}
                        /><span>TOKEN</span>
                    </div>
                </div>
                <div className="sendInputGroup">
                    <input 
                        placeholder="Enter Amount to Send..."
                        className="textInput"
                        type="text"
                        value={this.state.amount}
                        onChange={this.handleAmount}
                    />
                    { this.renderLabel() }
                </div>
                <div className="sendGroup">
                    <div className="sendGroupTop">
                        <div className="sendGroupHeader bold">Total</div>
                        <div className="sendGroupAmount bold orange">{ this.state.amount } { this.state.label }</div>
                    </div>
                    <div className="sendGroupBottom">11.28 <span>USD</span></div>
                </div>
                <div className="sendGroupDetail">Data Included: 36 bytes</div>
                <div className="sendGroup sendButtonContainer">
                    <div className="sendButton button outline" onClick={this.cancelTransaction()}>Cancel</div>
                    <div className="sendButton button gradient" onClick={this.sendTransaction()}>Confirm</div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    account: state.wallet.account
}))(Send);
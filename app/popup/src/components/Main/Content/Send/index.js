import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import './Send.css';

import { store, popup } from '../../../../index.js';


class Send extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: 'TRX',
            amount: 0,
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
        });
        return arr;
    }

    renderInput() {
        if (this.state.mode === 'TOKEN') {
            console.log(this.props.account.tokens)
            if (Object.keys(this.props.account.tokens).length > 0) {
                return (
                    <div className="sendInputGroup">
                        <input 
                            placeholder="Enter Amount to Send..."
                            className="textInput"
                            type="text"
                            value={this.state.amount}
                            onChange={this.handleAmount}
                            onFocus={e => e.target.select()}
                        />
                        <select>
                            {
                                this.loadTokens().forEach((token, i) => {
                                    <option value={token.id}>{token.label}</option>
                                })
                            }
                        </select>
                    </div>
                );
            }
            return <div className="sendInputGroup">No token balance to send.</div>
        }
        return (
            <div className="sendInputGroup">
                <input 
                    placeholder="Enter Amount to Send..."
                    className="textInput"
                    type="text"
                    value={this.state.amount}
                    onChange={this.handleAmount}
                    onFocus={e => e.target.select()}
                />
                <div className="sendLabel">TRX</div>
            </div>
        );
    }

    cancelTransaction() {
        console.log('Canceled.')
        this.props.history.push('/main');
        // store.dispatch();
    }

    sendTransaction() {
        popup.requestSend(this.props.txToDataAddress, this.state.amount);
        this.props.history.push('/main/transactions');
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
                        { /*temp disabled*/ }
                        <input 
                            type="radio"
                            value={'TOKEN'}
                            onChange={this.handleRadioToggle}
                            checked={this.state.mode === 'TOKEN'}
                            disabled
                        /><span className="disabled">TOKEN</span>
                    </div>
                </div>
                { this.renderInput() }
                <div className="sendGroup">
                    <div className="sendGroupTop">
                        <div className="sendGroupHeader bold">Total</div>
                        <div className="sendGroupAmount bold orange">{ this.state.amount } { this.state.label }</div>
                    </div>
                </div>
                <div className="sendGroupDetail">11.28 <span>USD</span></div>
                <div className="sendGroup sendButtonContainer">
                    <div className="sendButton button outline" onClick={this.cancelTransaction.bind(this)}>Cancel</div>
                    <div className="sendButton button gradient" onClick={this.sendTransaction.bind(this)}>Confirm</div>
                </div>
            </div>
        );
    }
}

export default withRouter(
    connect(
        state => ({ account: state.wallet.account }),
    )(Send)
);

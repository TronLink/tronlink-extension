import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import './ConfirmSend.css';

class ConfirmSend extends Component {
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
    render() {
        return (
            <div className="confirmSend">
                <div className="confirmGroup">
                    <div className="confirmGroupTop">
                        <div className="confirmGroupHeader bold">Total</div>
                        <div className="confirmGroupAmount bold orange">{ this.props.sendAmount } { this.props.sendLabel }</div>
                    </div>
                    <div className="confirmGroupBottom">11.28 <span>USD</span></div>
                </div>
                <div className="confirmGroupDetail">Data Included: 36 bytes</div>
                <div className="confirmGroup confirmButtonContainer">
                    <div className="confirmButton button outline">Reject</div>
                    <div className="confirmButton button gradient">Confirm</div>
                </div>
            </div>
        );
    }
}

export default ConfirmSend;
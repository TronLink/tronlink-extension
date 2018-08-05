import React, { Component } from 'react';
import { connect } from 'react-redux';

import './AddressView.css';

class AddressView extends Component {
    render() {
        const address = this.props.account.address;
        const balance = this.props.account.balance || 0;
        const trimmed = `${address.substr(0, 8)}...${address.substr(address.length - 8)}`;

        const usdValue = Number(
            this.props.price * balance
        ).toFixed(2).toLocaleString();

        return (
            <div className="send container">
                <div className="flowLine"></div>
                <div className="txDataContainer">
                    <div className="txAccountData">
                        <div className="txAccountDataLeft">
                            <div className="txAccountDataLabel"><span>From: </span>{ this.props.account.name }</div>
                            <div className="txAccountDataLabel">{ trimmed }</div>
                        </div>
                        <div className="txAccountDataRight">
                            <div className="txAccountDataLabel">{ balance.toLocaleString() } <span>TRX</span></div>
                            <div className="txAccountDataLabel">${ usdValue } <span>USD</span></div>
                        </div>
                    </div>
                    <div className="txToData">
                        <div className="txToDataHeader">Sending to:</div>
                        <input 
                            placeholder="Enter Address to Send to..."
                            className="txToDataAddress"
                            type="text"
                            spellcheck="false"
                            onChange={ ({ target: { value } }) => this.props.onSetAddress(value) }
                            onFocus={ e => e.target.select() }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    account: state.wallet.account,
    price: state.wallet.price
}))(AddressView);;

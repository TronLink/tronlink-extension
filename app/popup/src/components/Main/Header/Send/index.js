import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import './Send.css';

class Send extends Component {
    constructor(props) {
        super(props);

        this.state = {
            balance: 0
        };
    }

    renderTrimmedAddress() {
        let addr = this.props.account.address;
        return `${addr.substr(0, 8)}...${addr.substr(addr.length - 4)}`;
    }

    componentDidUpdate(prevProps) {
        if(this.props.account == prevProps.account)
            return;

        if(this.props.account) {
            this.setState({ 
                balance: (this.props.account.balance || 0) / 1000000
            });
        } else this.setState({ balance: 0 });
    };

    render() {
        const usdValue = Number(
            this.state.balance * this.props.price
        ).toFixed(2).toLocaleString();

        console.log('acc', this.props.account)

        return (
            <div className="send container">
                <div className="flowLine"></div>
                <div className="txDataContainer">
                    <div className="txAccountData">
                        <div className="txAccountDataLeft">
                            <div className="txAccountDataLabel"><span>From : </span>{ this.props.account.name }</div>
                            <div className="txAccountDataLabel">{ this.renderTrimmedAddress() }</div>
                        </div>
                        <div className="txAccountDataRight">
                            <div className="txAccountDataLabel">{ this.state.balance.toLocaleString() } <span> TRX</span></div>
                            <div className="txAccountDataLabel">${ usdValue } <span>USD</span></div>
                        </div>
                    </div>
                    <div className="txToData">
                        <div className="txToDataHeader">Sending to :</div>
                        <input 
                            placeholder="Enter Address to Send to..."
                            className="txToDataAddress"
                            type="text"
                            spellcheck="false"
                            onChange={this.props.onSetAddress}
                            onFocus={e => e.target.select()}
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
}))(Send);;

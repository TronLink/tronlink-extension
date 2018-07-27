import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import './Send.css';

class Send extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    renderTrimmedAddress() {
        let addr = this.props.account.address;
        return `${addr.substr(0, 8)}...${addr.substr(addr.length - 4)}`;
    }

    render() {
        console.log('acc', this.props.account)
        return (
            <div className="send container">
                <div className="flowLine"></div>
                <div className="txDataContainer">
                    <div className="txAccountData">
                        <div className="txAccountDataLeft">
                            <div className="txAccountDataLabel"><span>From : </span>PLacEh0Ld3RPLacEh0Ld3R</div>
                            <div className="txAccountDataLabel">{ this.renderTrimmedAddress() }</div>
                        </div>
                        <div className="txAccountDataRight">
                            <div className="txAccountDataLabel">4500.123 <span> PHDR</span></div>
                            <div className="txAccountDataLabel">356.41 <span>USD</span></div>
                        </div>
                    </div>
                    <div className="txToData">
                        <div className="txToDataHeader">Sending to :</div>
                        <div className="txToDataAddress">PLacEh0Ld3RPLacEh0Ld3R</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    account: state.wallet.account
}))(Send);;

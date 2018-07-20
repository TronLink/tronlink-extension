import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import './ConfirmSend.css';

class ConfirmSend extends Component {
    constructor(props) {
        super(props);

        this.state = {
            account: {
                name: 'ACCOUNT 1',
                address: 'T377BEIEUHGIJHBE9873093BGLKJBD5LG'
            }
        };
    }

    renderTrimmedAddress() {
        let addr = this.state.account.address;
        return `${addr.substr(0, 8)}...${addr.substr(addr.length - 4)}`;
    }

    render() {
        return (
            <div className="confirmSend container">
                <div className="flowLine"></div>
                <div className="txDataContainer">
                    <div className="txAccountData">
                        <div className="txAccountDataLeft">
                            <div className="txAccountDataLabel"><span>From : </span>{ this.state.account.name }</div>
                            <div className="txAccountDataLabel">{ this.renderTrimmedAddress() }</div>
                        </div>
                        <div className="txAccountDataRight">
                            <div className="txAccountDataLabel">{ this.props.sendAmount } <span>{ this.props.sendLabel }</span></div>
                            <div className="txAccountDataLabel">356.41 <span>USD</span></div>
                        </div>
                    </div>
                    <div className="txToData">
                        <div className="txToDataHeader">Sending to :</div>
                        <div className="txToDataAddress">{ this.props.toAddress }</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ConfirmSend;

import React, { Component } from 'react';
import './SendTron.css';

export default class SendTron extends Component {
    renderNote() {
        const {
            hostname,
            desc
        } = this.props.confirmation;

        return desc ? (
            <div className="confirmSubContainer">
                <div className="noteTitle">Note from: { hostname }</div>
                <div className="noteBody">{ desc }</div>
            </div>
        ) : (
            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">Site:</div>
                    <div className="confirmGroupAmount bold orange">{ hostname }</div>
                </div>
            </div>
        );
    }

    render() {
        const confirmation = this.props.confirmation;
        const amount = confirmation.amount / 1000000;

        const trxPrice = Number(
            amount * this.props.price
        ).toFixed(2).toLocaleString();

        return (
            <div className="confirmSend">
                { this.props.queueLength }
                { this.renderNote() }

                <div className="confirmGroup">
                    <div className="confirmGroupTop">
                        <div className="confirmGroupHeader bold">To:</div>
                        <div className="confirmGroupAddress bold orange">{ confirmation.recipient }</div>
                    </div>
                </div>

                <div className="confirmGroupTotal">
                    <div className="confirmGroupTop">
                        <div className="confirmGroupHeader bold">Total</div>
                        <div className="confirmGroupAmount bold orange">{ amount.toLocaleString() } TRX</div>
                    </div>
                    <div className="confirmGroupBottom">${ trxPrice } <span>USD</span></div>
                </div>

                <div className="confirmWarningHeader">&#9888; WARNING!</div>
                <div className="confirmWarningBody">
                    Only send funds to services and people that you trust.
                </div>

                { this.props.buttons }
            </div>
        );
    }
}
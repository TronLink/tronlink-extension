import React, { Component } from 'react';
import { connect } from 'react-redux';
import './SendTRX.css';

import { popup} from '../../index.js';
import { updateConfirmations } from '../../reducers/confirmations';

class SendTRX extends Component {
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

    renderNote() {
        const confirmation = this.props.confirmations[0];

        if (confirmation.desc) {
            return (
                <div className="confirmSubContainer">
                    <div className="noteTitle">Note from: { confirmation.hostname }</div>
                    <div className="noteBody">{ confirmation.desc }</div>
                </div>
            );
        }

        return (
            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">Site :</div>
                    <div className="confirmGroupAmount bold orange">{ confirmation.hostname }</div>
                </div>
            </div>
        );
    }

    render() {
        const confirmation = this.props.confirmations[0];
        const trxPrice = Number(
            confirmation.amount * this.props.trxPrice
        ).toFixed(2).toLocaleString();

        return (
            <div className="confirmSend">
                <div className="confirmQueueCountCont">
                    <div className="confirmQueueLabel">Confirmation Queue Length : { this.props.confirmations.length }</div>
                </div>
                { this.renderNote() }
                <div className="confirmGroup">
                    <div className="confirmGroupTop">
                        <div className="confirmGroupHeader bold">To :</div>
                        <div className="confirmGroupAddress bold orange">{ confirmation.recipient }</div>
                    </div>
                </div>
                <div className="confirmGroupTotal">
                    <div className="confirmGroupTop">
                        <div className="confirmGroupHeader bold">Total</div>
                        <div className="confirmGroupAmount bold orange">{ confirmation.amount } TRX</div>
                    </div>
                    <div className="confirmGroupBottom">${ trxPrice } <span>USD</span></div>
                </div>
                <div className="confirmWarningHeader">⚠ WARNING! </div>
                <div className="confirmWarningBody">Only send funds to services and people that you trust. TronLink is not responsible for your own mis-spending. Never send funds to websites that will promise you free returns.</div>
                <div className="confirmButtonContainer">
                    <div className="confirmButton button outline" onClick={ () => this.rejectSend() }>Reject</div>
                    <div className="confirmButton button gradient" onClick={ () => this.confirmSend() }>Confirm</div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    confirmations: state.confirmations.confirmations,
    trxPrice: state.wallet.price
}))(SendTRX);
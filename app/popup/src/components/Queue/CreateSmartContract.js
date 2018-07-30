import React, { Component } from 'react';
import { connect } from 'react-redux';
import './CreateSmartContract.css';

import { popup} from '../../index.js';
import { updateConfirmations } from '../../reducers/confirmations';

class CreateSmartContract extends Component {
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
                <div className="confirmSmartContract bold">Create Smart Contract</div>
                <div className="confirmGroup">
                    <textarea className="confirmTextArea"></textarea>
                </div>
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
}))(CreateSmartContract);
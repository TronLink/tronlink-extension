import React, { Component } from 'react';
import { connect } from 'react-redux';
import './CreateSmartContract.css';
import Logger from 'extension/logger';

import { popup } from 'index.js';
import { updateConfirmations } from 'reducers/confirmations';

const logger = new Logger('CreateSmartContract');

class CreateSmartContract extends Component {
    constructor(props){
        super(props);

        this.state = {
            disabled : false
        };
    }
    
    async rejectSend() {
        logger.info('Rejecting confirmation')
        
        popup.declineConfirmation(this.props.confirmations[0].id).catch(err => {
            logger.error('Declining confirmation failed', err);
        }).then(() => {
            updateConfirmations();
        });
    }

    async confirmSend() {
        logger.info('Accepting confirmation');

        this.setState({
            disabled: true
        });

        popup.acceptConfirmation(this.props.confirmations[0].id).catch(err => {
            logger.error('Accepting confirmation failed', err);
        }).then(() => {
            updateConfirmations();
        });
    }

    renderButtons(){
        return (
            <div hidden={ this.state.hidden } className="confirmButtonContainer">
                <div className="confirmButton button outline" onClick={ () => this.rejectSend() }>Reject</div>
                <div className="confirmButton button gradient" onClick={ () => this.confirmSend() }>Confirm</div>
            </div>
        )
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
                    <textarea value={JSON.stringify(confirmation.abi)} className="confirmTextArea" disabled></textarea>
                </div>
                { (!this.state.disabled) ? this.renderButtons() : 'Processing...' }
            </div>
        );
    }
}

export default connect(state => ({
    confirmations: state.confirmations.confirmations,
}))(CreateSmartContract);
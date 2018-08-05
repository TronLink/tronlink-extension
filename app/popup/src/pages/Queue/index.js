import React from 'react';
import { connect } from 'react-redux';
import { CONFIRMATION_TYPE } from 'extension/constants';
import { updateConfirmations } from 'reducers/confirmations';
import { popup } from 'index';

import Swal from 'sweetalert2';
import Logger from 'extension/logger';
import SendTron from './SendTron';
import CreateSmartContract from './CreateSmartContract';

import './Queue.css';

const logger = new Logger('Queue');

class Queue extends React.Component {
    state = {
        loading: false,
        error: false
    }

    handleResult(error = false) {
        this.setState({
            error
        });

        const config = {
            type: 'success',
            title: 'Transaction sent'
        };

        if(error) {
            config.type = 'error';
            config.title = 'Transaction failed';
            config.text = error;
        };

        return Swal(config).then(res => {
            logger.info('Swal Res', res);

            this.setState({
                loading: false 
            });

            updateConfirmations();
        });
    }

    acceptConfirmation({ id }) {
        logger.info('Accepting confirmation', id);

        this.setState({
            loading: true,
            error: false
        });

        return popup.acceptConfirmation(id).catch(error => {
            logger.error('Accepting confirmation failed', error);
            return error;
        }).then((error = false) => {
            this.handleResult(error);
        });
    }

    rejectConfirmation({ id }) {
        logger.info('Rejecting confirmation', id);
        
        this.setState({
            loading: true,
            error: false
        });
        
        return popup.declineConfirmation(id).then(() => 'Transaction declined').catch(error => {
            logger.error('Declining confirmation failed', error);
            return error;
        }).then((error = false) => {
            logger.info(error);
            this.handleResult(error);
        });
    }

    renderers(confirmation) {
        return { 
            buttons: (
                /*this.state.loading ? 'Processing' : */(
                    <div className="confirmButtonContainer">
                        <div className="confirmButton button outline" onClick={ () => this.rejectConfirmation(confirmation) }>Reject</div>
                        <div className="confirmButton button gradient" onClick={ () => this.acceptConfirmation(confirmation) }>Confirm</div>
                    </div>
                )
            ),
            queueLength: (
                <div className="confirmQueueCountCont">
                    <div className="confirmQueueLabel">
                        Confirmation Queue Length: { this.props.confirmations.length }
                    </div>
                </div>
            )
        };
    }

    render() {
        const { confirmations } = this.props;
        const [ confirmation ] = confirmations;

        let Component = (
            <span>
                Failed to identify confirmation
            </span>
        );

        switch(confirmation.type) {
            case CONFIRMATION_TYPE.SEND_TRON: {
                Component = SendTron;
                break;
            }
            case CONFIRMATION_TYPE.CREATE_SMARTCONTRACT: {
                Component = CreateSmartContract;
                break;
            }
        }

        return (
            <div className="queue">
                <Component 
                    confirmation={ confirmation } 
                    price={ this.props.price }
                    { ...this.renderers(confirmation) }
                    { ...this.state }
                />
            </div>
        );
    }
}

export default connect(state => ({
    confirmations: state.confirmations.confirmations,
    price: state.wallet.price
}))(Queue);
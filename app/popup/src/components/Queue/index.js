import React from 'react';
import { connect } from 'react-redux';
import { CONFIRMATION_TYPE } from 'extension/constants';
import { updateConfirmations } from 'reducers/confirmations';
import { popup } from 'index';
import { injectIntl, FormattedMessage } from 'react-intl';

import Swal from 'sweetalert2';
import Logger from 'extension/logger';
import SendTron from './Renderers/SendTron';
import SendAsset from './Renderers/SendAsset';
import IssueAsset from './Renderers/IssueAsset';
import CreateSmartContract from './Renderers/CreateSmartContract';
import TriggerSmartContract from './Renderers/TriggerSmartContract';
import SignSmartContract from './Renderers/SignSmartContract';
import Freeze from './Renderers/Freeze';
import Unfreeze from './Renderers/Unfreeze';
import Button from 'components/Button';

import './Queue.css';

const logger = new Logger('Queue');

class Queue extends React.Component {
    state = {
        loading: false,
        error: false
    };

    constructor(props) {
        super(props);
        this.translate = props.intl.formatMessage;
    }

    handleResult(error = false) {
        this.setState({
            error
        });

        const config = {
            type: 'success',
            title: this.translate({ id: 'queue.transaction.sent' })
        };

        if (error) {
            config.type = 'error';
            config.title = this.translate({ id: 'queue.transaction.failed' });
            config.text = error;
        }

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
            loading: 'accept',
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
            loading: 'reject',
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
                <div className="confirmButtonContainer">
                    <Button
                        onClick={ () => this.rejectConfirmation(confirmation) }
                        type={ 'secondary' }
                        loading={ this.state.loading == 'reject' }
                        disabled={ this.state.loading == 'accept' }
                        style={ { 'margin-right': '10px' } }
                    >
                        <FormattedMessage id='words.reject'/>
                    </Button>
                    <Button
                        onClick={ () => this.acceptConfirmation(confirmation) }
                        loading={ this.state.loading == 'accept' }
                        disabled={ this.state.loading == 'reject' }
                        style={ { 'margin-left': '10px' } }
                    >
                        <FormattedMessage id='words.confirm'/>
                    </Button>
                </div>
            ),
            queueLength: (
                <div className="confirmQueueCountCont">
                    <div className="confirmQueueLabel">
                        <FormattedMessage
                            id='queue.length'
                            values={ { length: this.props.confirmations.length } }/>
                    </div>
                </div>
            )
        };
    }

    render() {
        const { confirmations } = this.props;
        const [confirmation] = confirmations;

        let Component = (
            <span>
                <FormattedMessage id='queue.unknownConfirmation'/>
            </span>
        );

        switch (confirmation.type) {
            case CONFIRMATION_TYPE.SEND_TRON: {
                Component = SendTron;
                break;
            }
            case CONFIRMATION_TYPE.SEND_ASSET: {
                Component = SendAsset;
                break;
            }
            case CONFIRMATION_TYPE.ISSUE_ASSET: {
                Component = IssueAsset;
                break;
            }
            case CONFIRMATION_TYPE.CREATE_SMARTCONTRACT: {
                Component = CreateSmartContract;
                break;
            }
            case CONFIRMATION_TYPE.TRIGGER_SMARTCONTRACT: {
                Component = TriggerSmartContract;
                break;
            }
            case CONFIRMATION_TYPE.SIGN_SMARTCONTRACT: {
                Component = SignSmartContract;
                break;
            }
            case CONFIRMATION_TYPE.FREEZE: {
                Component = Freeze;
                break;
            }
            case CONFIRMATION_TYPE.UNFREEZE: {
                Component = Unfreeze;
                break;
            }
            default: {
                logger.error('Attempted to render unknown confirmation type', confirmation);
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

export default injectIntl(
    connect(state => ({
        confirmations: state.confirmations.confirmations,
        price: state.wallet.price
    }))(Queue)
);

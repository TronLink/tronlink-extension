import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

export default class SignSmartContract extends Component {
    render() {
        const confirmation = this.props.confirmation;

        const transaction = this.props.confirmation.transaction;

        return (
            <div className="confirmSend">
                { this.props.queueLength  }

                <div className="confirmSmartContract bold">
                    <FormattedMessage id='queue.smartContract.trigger' />
                </div>

                <div className="confirmGroup">
                    <textarea value={ 
                        JSON.stringify(transaction, null, 2) 
                    } className="confirmTextArea" readonly></textarea>
                </div>

                { this.props.buttons }
            </div>
        );
    }
}

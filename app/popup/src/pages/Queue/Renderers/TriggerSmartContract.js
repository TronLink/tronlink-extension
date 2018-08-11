import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

export default class TriggerSmartContract extends Component {
    render() {
        const confirmation = this.props.confirmation;

        const payload = {
            address: confirmation.address,
            function: confirmation.functionSelector,
            parameters: confirmation.parameters,
            ...confirmation.options
        };

        return (
            <div className="confirmSend">
                { this.props.queueLength  }

                <div className="confirmSmartContract bold">
                    <FormattedMessage id='queue.smartContract.trigger' />
                </div>

                <div className="confirmGroup">
                    <textarea value={ 
                        JSON.stringify(payload, null, 2) 
                    } className="confirmTextArea" readonly></textarea>
                </div>

                { this.props.buttons }
            </div>
        );
    }
}

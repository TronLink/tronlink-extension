import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

export default class CreateSmartContract extends Component {
    render() {
        const confirmation = this.props.confirmation;

        return (
            <div className="confirmSend">
                { this.props.queueLength }

                <div className="confirmSmartContract bold">
                    <FormattedMessage id='queue.smartContract.create' />
                </div>
                
                <div className="confirmGroup">
                    <textarea value={ 
                        JSON.stringify(confirmation.abi, null, 2) 
                    } className="confirmTextArea" readonly></textarea>
                </div>

                { this.props.buttons }
            </div>
        );
    }
}
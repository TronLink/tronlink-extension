import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

export default class TriggerSmartContract extends Component {
    render() {
        return (
            <div className="confirmSend">
                { this.props.queueLength  }

                <div className="confirmSmartContract bold">
                    <FormattedMessage id='queue.smartContract.trigger' />
                </div>
                
                <div className="confirmGroup">
                    <textarea value="" className="confirmTextArea" readonly/>
                </div>

                { this.props.buttons }
            </div>
        );
    }
}

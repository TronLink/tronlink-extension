import React, { Component } from 'react';

export default class TriggerSmartContract extends Component {
    render() {
        //const confirmation = this.props.confirmation;
        return (
            <div className="confirmSend">
                {this.props.queueLength}

                <div className="confirmSmartContract bold">Trigger Smart Contract</div>
                <div className="confirmGroup">
                    <textarea
                        value=""
                        className="confirmTextArea"
                        readonly/>
                </div>

                {this.props.buttons}
            </div>
        );
    }
}

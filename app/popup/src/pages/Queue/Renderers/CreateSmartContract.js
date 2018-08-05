import React, { Component } from 'react';

export default class CreateSmartContract extends Component {
    render() {
        const confirmation = this.props.confirmation;

        return (
            <div className="confirmSend">
                { this.props.queueLength }

                <div className="confirmSmartContract bold">Create Smart Contract</div>
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